// ────────────────────────────────────────────────
// server/middleware/auth.js
// ────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ---------- ENV check ---------- */
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in .env");
  process.exit(1);
}

/* ---------- Authenticate Access Token ---------- */
const authenticateToken = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization;
    if (!hdr || !hdr.startsWith("Bearer "))
      return res.status(401).json({ message: "Access token required." });

    const token = hdr.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.uid).select(
      "isVerified isEmailVerified role businessId"
    );

    if (!user) return res.status(401).json({ message: "User not found." });

    /* accept if EITHER flag is true */
    const verified = user.isVerified || user.isEmailVerified;
    if (!verified)
      return res.status(401).json({ message: "Account not verified." });

    req.user = {
      uid: decoded.uid,
      role: decoded.role,
      businessId: decoded.businessId,
      currentRole: user.role,
      currentBusinessId: user.businessId,
      isVerified: verified, // combined flag
    };
    next();
  } catch (err) {
    console.error("Token authentication error:", err.message);
    if (err.name === "TokenExpiredError")
      return res
        .status(401)
        .json({ message: "Access token expired.", code: "TOKEN_EXPIRED" });
    if (err.name === "JsonWebTokenError")
      return res
        .status(401)
        .json({ message: "Invalid access token.", code: "INVALID_TOKEN" });
    return res.status(401).json({ message: "Authentication failed." });
  }
};

/* ---------- Refresh Token ---------- */
/* ---------- Refresh Token ---------- */
const refreshToken = async (req, res) => {
  try {
    const rt = req.cookies.refreshToken;
    if (!rt)
      return res.status(401).json({ message: "Refresh token required." });

    const decoded = jwt.verify(
      rt,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    if (decoded.type !== "refresh")
      return res.status(401).json({ message: "Invalid refresh token." });

    /* fetch BOTH flags */
    const user = await User.findById(decoded.uid).select(
      "isVerified isEmailVerified role businessId"
    );

    const verified = user?.isVerified || user?.isEmailVerified;
    if (!user || !verified)
      return res.status(401).json({
        message: "User not found or not verified.",
      });

    const payload = {
      uid: user._id,
      role: user.role,
      businessId: user.businessId ?? null,
    };
    const ttl = process.env.JWT_EXPIRES_IN || "15m";
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ttl,
    });

    return res.json({ accessToken: token });
  } catch (err) {
    console.error("Refresh token error:", err.message);

    if (err.name === "TokenExpiredError")
      return res.status(401).json({
        message: "Refresh token expired. Please login again.",
        code: "REFRESH_EXPIRED",
      });

    if (err.name === "JsonWebTokenError")
      return res
        .status(401)
        .json({ message: "Invalid refresh token.", code: "INVALID_REFRESH" });

    return res.status(401).json({ message: "Token refresh failed." });
  }
};

/* ---------- Role-based Access Control ---------- */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Authentication required." });

  const role = req.user.currentRole || req.user.role;
  const allow = Array.isArray(roles) ? roles : [roles];
  if (!allow.includes(role))
    return res.status(403).json({
      message: `Access denied. Required role: ${allow.join(" or ")}.`,
    });

  next();
};

module.exports = { authenticateToken, refreshToken, requireRole };
