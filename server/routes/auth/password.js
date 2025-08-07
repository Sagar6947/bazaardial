/* ───────────────────────────────────────────────
   server/routes/auth/password.js
   Supports BOTH mobile-OTP and email-OTP flows
──────────────────────────────────────────────── */
const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../../models/User");
const {
  sendOtpSms,
  sendOtpEmail,
  formatMobile,
  isValidEmail,
} = require("../../middleware/otpSmsHelper");

const router = express.Router();

/* ───── Rate-limit: 5 attempts / 15 min per IP ───── */
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  message: { message: "Too many password attempts. Try again later." },
});

/* ───── Helpers ───── */
const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();
const isStrongPw = (p) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);

/* ───────────────────────────────────────────────
   1) REQUEST RESET OTP  (mobile OR email)
──────────────────────────────────────────────── */
router.post("/request-reset", authLimiter, async (req, res) => {
  const { mobile, email } = req.body;

  /* —— Validate input —— */
  if (!mobile && !email)
    return res.status(400).json({ message: "Provide mobile or email." });

  let user, channel;
  try {
    if (mobile) {
      const m10 = formatMobile(mobile);
      user = await User.findOne({ mobile: m10, isVerified: true });
      channel = "mobile";
    } else {
      if (!isValidEmail(email))
        return res.status(400).json({ message: "Invalid email." });
      user = await User.findOne({
        email: email.toLowerCase(),
        isEmailVerified: true,
      });
      channel = "email";
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  if (!user) return res.status(404).json({ message: "User not found." });

  /* —— Generate & save OTP —— */
  user.otp = generateOTP();
  user.otpExpires = Date.now() + 30 * 60_000;
  user.otpAttempts = 0;
  user.otpAttemptsExpire = undefined;
  await user.save();

  /* —— Send OTP —— */
  try {
    if (channel === "mobile") await sendOtpSms(user.mobile, user.otp, "reset");
    else await sendOtpEmail(user.email, user.otp, "reset");
  } catch (err) {
    console.error("OTP send failed:", err.message);
    return res.status(500).json({ message: "Failed to send OTP." });
  }

  res.json({ message: "OTP sent. Valid for 30 minutes." });
});

/* ───────────────────────────────────────────────
   2) VERIFY RESET OTP  (mobile OR email)
──────────────────────────────────────────────── */
router.post("/verify-reset-otp", authLimiter, async (req, res) => {
  const { mobile, email, otp } = req.body;
  if (!otp || (!mobile && !email))
    return res.status(400).json({ message: "Contact & OTP required." });

  let user;
  if (mobile) {
    try {
      user = await User.findOne({ mobile: formatMobile(mobile) });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } else {
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email." });
    user = await User.findOne({ email: email.toLowerCase() });
  }

  if (!user) return res.status(404).json({ message: "User not found." });

  if (user.otp !== otp || Date.now() > user.otpExpires) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= 3)
      user.otpAttemptsExpire = Date.now() + 15 * 60_000;
    await user.save();
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  /* —— Return short-lived JWT so front-end can send new password safely —— */
  const resetToken = jwt.sign(
    { uid: user._id, otp, ts: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  res.json({ message: "OTP verified.", token: resetToken });
});

/* ───────────────────────────────────────────────
   3) RESET PASSWORD (token from step 2)
──────────────────────────────────────────────── */
router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Token & password required." });

  if (!isStrongPw(password))
    return res.status(400).json({
      message: "Password must be ≥8 chars, include A-Z, a-z & a digit.",
    });

  try {
    const { uid, otp } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(uid);
    if (!user || user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ message: "Reset session expired." });

    user.password = password; // pre-save hook hashes it
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpAttemptsExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch {
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
