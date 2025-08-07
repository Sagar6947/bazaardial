// server/routes/auth/username.js
const express = require("express");
const router = express.Router();
const User = require("../../models/User");

/**
 * GET  /api/auth/check-username?username=john_doe
 * 200 → available
 * 409 → already taken
 * 400 → missing / invalid param
 */
router.get("/check-username", async (req, res) => {
  try {
    const raw = (req.query.username || "").toLowerCase().trim();

    if (raw.length < 3 || !/^[a-zA-Z0-9_]+$/.test(raw))
      return res.status(400).json({ message: "Invalid username." });

    const exists = await User.exists({ username: raw });
    if (exists) return res.status(409).json({ message: "Username taken." });

    res.json({ message: "Username available." }); // 200
  } catch (err) {
    console.error("check-username error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
