const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../../models/User");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  message: { message: "Too many login attempts. Try again later." },
});

const signTokens = (user) => {
  const payload = {
    uid: user._id,
    role: user.role,
    businessId: user.businessId ?? null,
  };

  return {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    }),
    refreshToken: jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    ),
  };
};

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier & password are required." });
    }

    // Match mobile, email, or username
    const query = /^\d{10}$/.test(identifier)
      ? { mobile: identifier }
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isVerified && !user.isEmailVerified) {
      return res.status(401).json({ message: "Verify your account first." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const { accessToken, refreshToken } = signTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

