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

/* ───── 1) Test OTP ───── */
router.post("/testOtp", async (req, res) => {
    console.log("hello")
  const phoneNumber = req.body.number || "6265965711"; // fallback if not provided
  const otp = Math.floor(100000 + Math.random() * 900000);

  const message = `Hi, Your OTP for verify your mobile number is ${otp} From Demo. Valid for 30 minutes. Please do not share this OTP.\nRegards,\nGNOSISACCRUE Team`;

  const url = "https://www.wpsenders.in/api/sendTextMessage";
  const formData = new URLSearchParams({
    api_key: "LO64D86UW28H8J5R",
    number: phoneNumber,
    message: message,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.text();
    console.log("WPSender Response:", data);

    res.status(200).send(data);
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).send("SMS sending failed.");
  }
});

module.exports = router;
