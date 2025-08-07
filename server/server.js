/* server/server.js */
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const businessRoutes = require("./routes/business");

const Business = require("./models/Business");
const User = require("./models/User"); // ← added

const app = express();

/* ─────────────────────────────
   1. ENV check
   ───────────────────────────── */
["MONGO_URI", "FRONTEND_URL", "JWT_SECRET"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing ${key} in .env`);
    process.exit(1);
  }
});

/* ─────────────────────────────
   2. Middleware
   ───────────────────────────── */
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ─────────────────────────────
   3. Favicon
   ───────────────────────────── */
app.get("/favicon.ico", (req, res) => {
  const p = path.join(__dirname, "../dist/favicon.ico");
  res.sendFile(p, (err) => err && res.status(204).end());
});

/* ─────────────────────────────
   4. Health check
   ───────────────────────────── */
app.get("/api/health", (_req, res) => res.send("API is up ✅"));

/* ─────────────────────────────
   5. API Routes
   ───────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/user", userRoutes);

/* ─────────────────────────────
   6. Serve Front-end build (optional)
   ───────────────────────────── */
const clientDist = path.join(__dirname, "../client/dist");

if (!fs.existsSync(clientDist)) {
  console.warn("⚠️  React build folder 'dist/' not found");
  app.get("*", (_, res) =>
    res.status(503).json({ message: "Frontend build missing" })
  );
} else {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/"))
      return res.status(404).json({ message: "API route not found" });
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

/* ─────────────────────────────
   7. Error Handler
   ───────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("💥 Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ─────────────────────────────
   8. Start server
   ───────────────────────────── */
async function startServer() {
  try {
    await connectDB();

    /* ensure indexes: Business & User */
    await Promise.all([Business.syncIndexes(), User.syncIndexes()]);
    console.log("✅ DB connected & indexes synced");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () =>
      console.log(`🚀  Server ready at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
