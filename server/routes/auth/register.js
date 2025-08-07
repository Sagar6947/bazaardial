const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const {
  sendOtpSms,
  sendOtpEmail,
  formatMobile,
  isValidEmail,
} = require("../../middleware/otpSmsHelper");

const OTP_LENGTH = 5;
const OTP_TTL = 30 * 60 * 1000; // 30 min

/* ───── helper ───── */
const genOtp = () =>
  Math.floor(Math.random() * 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");

/* ───── 1) REGISTER ───── */
router.post("/register", async (req, res) => {
  try {
    const { username, password, mobile, email } = req.body;

    /* basic checks */
    if (!username || !password)
      return res.status(400).json({ message: "Username & password required." });

    if (!mobile && !email)
      return res
        .status(400)
        .json({ message: "Provide either mobile or email." });

    let contactType; // "mobile" | "email"
    const userData = { username, password };

    if (mobile) {
      userData.mobile = formatMobile(mobile);
      contactType = "mobile";
    }

    if (email) {
      if (!isValidEmail(email))
        return res.status(400).json({ message: "Invalid email." });
      userData.email = email.toLowerCase().trim();
      contactType = "email";
    }

    /* user create */
    const otp = genOtp();
    const now = Date.now();
    if (contactType === "mobile") {
      userData.otp = otp;
      userData.otpExpires = new Date(now + OTP_TTL);
    } else {
      userData.emailOtp = otp;
      userData.emailOtpExpires = new Date(now + OTP_TTL);
    }

    const user = await User.create(userData);

    /* send OTP */
    if (contactType === "mobile")
      await sendOtpSms(user.mobile, otp, "registration");
    else await sendOtpEmail(user.email, otp, "registration");

    return res.json({ message: "OTP sent." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ───── 2) VERIFY MOBILE OTP ───── */
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const formatted = formatMobile(mobile);
    const user = await User.findOne({ mobile: formatted });

    if (
      !user ||
      user.isVerified ||
      user.otp !== otp ||
      user.otpExpires < Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired OTP." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { uid: user._id, role: user.role, businessId: user.businessId ?? null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ───── 3) VERIFY EMAIL OTP ───── */
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (
      !user ||
      user.isEmailVerified ||
      user.emailOtp !== otp ||
      user.emailOtpExpires < Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired OTP." });

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { uid: user._id, role: user.role, businessId: user.businessId ?? null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ───── 4) RESEND OTP (mobile or email) ───── */
router.post("/resend-otp", async (req, res) => {
  try {
    const { contact, via } = req.body;
    if (via === "mobile") {
      const formatted = formatMobile(contact);
      const user = await User.findOne({ mobile: formatted });
      if (!user) return res.status(404).json({ message: "User not found." });

      const otp = genOtp();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + OTP_TTL);
      await user.save();
      await sendOtpSms(user.mobile, otp, "registration");
    } else {
      const user = await User.findOne({ email: contact.toLowerCase() });
      if (!user) return res.status(404).json({ message: "User not found." });

      const otp = genOtp();
      user.emailOtp = otp;
      user.emailOtpExpires = new Date(Date.now() + OTP_TTL);
      await user.save();
      await sendOtpEmail(user.email, otp, "registration");
    }
    res.json({ message: "OTP resent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
