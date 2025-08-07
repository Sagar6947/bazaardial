const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../../models/User");
const { sendOtpSms, formatMobile } = require("../../middleware/otpSmsHelper");

const router = express.Router();

/* ───── Rate Limiter ───── */
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  message: { message: "Too many OTP attempts. Try again later." },
});

/* ───── Helpers ───── */
const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

/* ───── MOBILE OTP VERIFY ───── */
router.post("/verify-otp", authLimiter, async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp)
    return res.status(400).json({ message: "Mobile and OTP required." });

  let mobile10;
  try {
    mobile10 = formatMobile(mobile);
  } catch {
    return res.status(400).json({ message: "Invalid mobile format." });
  }

  const user = await User.findOne({ mobile: mobile10 });
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isVerified)
    return res.status(400).json({ message: "Already verified." });

  if (user.otp !== otp || Date.now() > user.otpExpires) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= 3) {
      user.otpAttemptsExpire = Date.now() + 15 * 60_000;
    }
    await user.save();
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpAttemptsExpire = undefined;
  await user.save();

  return res.json({
    message: "Mobile verified successfully.",
    user: { id: user._id, username: user.username },
  });
});

/* ───── EMAIL OTP VERIFY ───── */
router.post("/verify-email-otp", authLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required." });

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isEmailVerified)
    return res.status(400).json({ message: "Already verified." });

  if (user.emailOtp !== otp || Date.now() > user.emailOtpExpires) {
    user.emailOtpAttempts += 1;
    if (user.emailOtpAttempts >= 3) {
      user.emailOtpAttemptsExpire = Date.now() + 15 * 60_000;
    }
    await user.save();
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpAttempts = 0;
  user.emailOtpAttemptsExpire = undefined;
  await user.save();

  return res.json({
    message: "Email verified successfully.",
    user: { id: user._id, username: user.username },
  });
});

/* ───── RESEND OTP (mobile or email) ───── */
router.post("/resend-otp", authLimiter, async (req, res) => {
  const { contact, via } = req.body;

  if (!contact || !["mobile", "email"].includes(via)) {
    return res
      .status(400)
      .json({ message: "Contact and valid 'via' field required." });
  }

  try {
    let user, otpField, sendOtpFn;

    if (via === "mobile") {
      const mobile10 = formatMobile(contact);
      user = await User.findOne({ mobile: mobile10, isVerified: false });
      if (!user)
        return res
          .status(404)
          .json({ message: "User not found or already verified." });

      otpField = "otp";
      sendOtpFn = () => sendOtpSms(mobile10, user.otp, "resend");
    } else {
      const cleanEmail = contact.trim().toLowerCase();
      user = await User.findOne({ email: cleanEmail, isEmailVerified: false });
      if (!user)
        return res
          .status(404)
          .json({ message: "User not found or already verified." });

      otpField = "emailOtp";
      sendOtpFn = () => sendOtpEmail(cleanEmail, user.emailOtp, "resend");
    }

    const now = Date.now();
    const lastSentAt = user[`${otpField}Expires`] - 30 * 60_000;
    if (lastSentAt && now - lastSentAt < 120_000) {
      return res
        .status(429)
        .json({ message: "Wait 2 minutes before resending." });
    }

    const otp = generateOTP();
    user[otpField] = otp;
    user[`${otpField}Expires`] = now + 30 * 60_000;
    user[`${otpField}Attempts`] = 0;
    user[`${otpField}AttemptsExpire`] = undefined;
    await user.save();

    await sendOtpFn();

    return res.json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("Resend OTP failed:", err.message);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});

module.exports = router;
