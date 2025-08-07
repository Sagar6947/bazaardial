// ────────────────────────────────────────────────
// server/routes/user.js
// ────────────────────────────────────────────────
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/* ---------- rate limits ---------- */
const profileLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 min
  max: 10,
  message: { message: "Too many profile requests. Try later." },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  message: { message: "Too many upload attempts. Try later." },
});

/* ---------- multer config ---------- */
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "avatars");
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const stamp = Date.now();
    const rnd = Math.round(Math.random() * 1e9);
    cb(null, `${req.user.uid}_${stamp}_${rnd}${ext}`);
  },
});

const allowedTypes = /jpeg|jpg|png|gif|webp/;
const fileFilter = (_req, file, cb) => {
  const ok =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});

/* ---------- helpers ---------- */
const deleteOldAvatar = async (avatarPath) => {
  if (!avatarPath) return;
  const full = path.isAbsolute(avatarPath)
    ? avatarPath
    : path.join(process.cwd(), "uploads", "avatars", path.basename(avatarPath));
  try {
    await fs.access(full);
    await fs.unlink(full);
  } catch (err) {
    if (err.code !== "ENOENT") console.warn("Failed to delete avatar:", err);
  }
};

const isValidEmail = (e) =>
  !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

const isValidUsername = (u) =>
  u && u.length >= 3 && u.length <= 20 && /^[a-zA-Z0-9_]+$/.test(u);

const isValidPassword = (p) =>
  p && p.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);

/* ────────────────────────────────────────────
   POST /avatar
──────────────────────────────────────────── */
router.post(
  "/avatar",
  authenticateToken,
  uploadLimiter,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No image file provided." });

      const user = await User.findById(req.user.uid);
      if (!user) {
        await deleteOldAvatar(req.file.path);
        return res.status(404).json({ message: "User not found." });
      }

      if (user.avatar) await deleteOldAvatar(user.avatar);

      user.avatar = req.file.filename;
      await user.save();

      return res.json({
        message: "Avatar updated successfully.",
        avatar: `/uploads/avatars/${req.file.filename}`,
      });
    } catch (err) {
      if (req.file) await deleteOldAvatar(req.file.path);
      if (err.message.includes("Only image files"))
        return res.status(400).json({ message: err.message });
      if (err.code === "LIMIT_FILE_SIZE")
        return res
          .status(400)
          .json({ message: "File too large. Maximum size is 5MB." });
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Failed to upload avatar." });
    }
  }
);

/* ────────────────────────────────────────────
   GET /profile
──────────────────────────────────────────── */
router.get("/profile", authenticateToken, profileLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid)
      .select(
        "-password -otp -otpExpires -otpAttempts -otpAttemptsExpire -loginAttempts -lockUntil"
      )
      .populate("businessId", "name status");

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      ...user.toJSON(),
      avatar: user.avatar
        ? `/uploads/avatars/${path.basename(user.avatar)}`
        : null,
      /* combined flag ↓ */
      isVerified: user.isVerified || user.isEmailVerified,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

/* ────────────────────────────────────────────
   PUT /profile
──────────────────────────────────────────── */
router.put("/profile", authenticateToken, profileLimiter, async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required." });
    }
    if (!isValidUsername(username.trim()))
      return res.status(400).json({
        message:
          "Username must be 3-20 characters (letters, numbers, underscore).",
      });
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    const user = await User.findById(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found." });

    const uname = username.trim().toLowerCase();
    const mail = email?.trim().toLowerCase() || undefined;

    if (uname !== user.username) {
      const clash = await User.findOne({
        username: uname,
        _id: { $ne: user._id },
      });
      if (clash)
        return res.status(409).json({ message: "Username is already taken." });
      user.username = uname;
    }

    user.email = mail;
    await user.save();

    return res.json({
      ...user.toJSON(),
      avatar: user.avatar
        ? `/uploads/avatars/${path.basename(user.avatar)}`
        : null,
      isVerified: user.isVerified || user.isEmailVerified,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res
        .status(409)
        .json({
          message: `${
            field === "username" ? "Username" : "Email"
          } is already taken.`,
        });
    }
    res.status(500).json({ message: "Failed to update profile." });
  }
});

/* ────────────────────────────────────────────
   PUT /change-password
──────────────────────────────────────────── */
router.put(
  "/change-password",
  authenticateToken,
  profileLimiter,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword)
        return res
          .status(400)
          .json({ message: "Current password and new password are required." });

      if (!isValidPassword(newPassword))
        return res.status(400).json({
          message:
            "New password must be at least 8 characters with upper-, lower-case and a number.",
        });

      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: "User not found." });

      const ok = await user.comparePassword(currentPassword);
      if (!ok)
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });

      const same = await user.comparePassword(newPassword);
      if (same)
        return res
          .status(400)
          .json({ message: "New password must differ from current." });

      user.password = newPassword; // will hash in pre-save
      await user.save();
      res.json({ message: "Password changed successfully." });
    } catch (err) {
      console.error("Change password error:", err);
      res.status(500).json({ message: "Failed to change password." });
    }
  }
);

/* ────────────────────────────────────────────
   DELETE /avatar
──────────────────────────────────────────── */
router.delete(
  "/avatar",
  authenticateToken,
  profileLimiter,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: "User not found." });

      if (!user.avatar)
        return res.status(400).json({ message: "No avatar to delete." });

      await deleteOldAvatar(user.avatar);
      user.avatar = undefined;
      await user.save();
      res.json({ message: "Avatar deleted successfully." });
    } catch (err) {
      console.error("Delete avatar error:", err);
      res.status(500).json({ message: "Failed to delete avatar." });
    }
  }
);

/* ────────────────────────────────────────────
   GET /stats
──────────────────────────────────────────── */
router.get("/stats", authenticateToken, profileLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).populate(
      "businessId",
      "name status createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    const stats = {
      memberSince: user.createdAt,
      role: user.role,
      isVerified: user.isVerified || user.isEmailVerified,
      hasAvatar: !!user.avatar,
      business: user.businessId
        ? {
            name: user.businessId.name,
            status: user.businessId.status,
            createdAt: user.businessId.createdAt,
          }
        : null,
    };
    res.json(stats);
  } catch (err) {
    console.error("Get user stats error:", err);
    res.status(500).json({ message: "Failed to fetch user statistics." });
  }
});

module.exports = router;
