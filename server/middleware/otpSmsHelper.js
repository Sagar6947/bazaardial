const axios = require("axios");
const qs = require("qs");
const nodemailer = require("nodemailer");
require("dotenv").config();

/* ────────────────── ENV Setup ────────────────── */
const APP_NAME = process.env.APP_NAME || "Bazaardial";

/* SMS-gateway settings */
const API_KEY = process.env.WPSENDERS_API_KEY || "";
const WPSENDERS_API_URL = process.env.WPSENDERS_API_URL || "";
const TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || "";

const SMS_TIMEOUT = +process.env.SMS_TIMEOUT || 8_000;
const SMS_RETRIES = +process.env.SMS_RETRIES || 1;
const RATE_WINDOW = 2 * 60 * 1_000; // 2 min
const MAX_PER_WIN = 3;

/* Email settings */
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@bazaardial.com";
const EMAIL_SUBJECT = `Your OTP - ${APP_NAME}`;
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: +process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

/* ─────────── SMS Message (DLT exact match) ───────────
   **Do not change any text or spacing** unless you update
   the template in your WPSenders / DLT portal as well.   */
const buildSmsMsg = (otp) =>
  `Hi, Your OTP for verify your mobile number is ${otp} From ${APP_NAME}. ` +
  `Valid for 30 minutes. Please do not share this OTP. ` +
  `Regards, GNOSISACCRUE Team`;

/* Map every “purpose” to the same SMS text */
const SMS_TEMPLATES = {
  registration: buildSmsMsg,
  login: buildSmsMsg,
  reset: buildSmsMsg,
  default: buildSmsMsg,
};

/* ─────────── Email Message builders ─────────── */
const buildEmailText = (otp, ctx) =>
  `Hi,\n\nYour OTP for ${ctx} is ${otp}.\n` +
  `Valid for 30 minutes. Do not share this OTP.\n\n– Team ${APP_NAME}`;

const buildEmailHtml = (otp, ctx) => `
  <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
    <h2>OTP for ${ctx}</h2>
    <p>Your one-time password (OTP) is:</p>
    <h1 style="color:#e26936;font-size:32px;">${otp}</h1>
    <p>This OTP is valid for 30 minutes. Do not share it with anyone.</p>
    <p style="color:gray;">– Team ${APP_NAME}</p>
  </div>
`;

/* ─────────── Validation helpers ─────────── */
const isValidIndianMobile = (n) => /^[6-9]\d{9}$/.test(n);

function formatMobile(raw) {
  if (!raw) throw new Error("Mobile is required");
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (!isValidIndianMobile(digits))
    throw new Error(
      "Mobile must be a 10-digit Indian number starting with 6-9"
    );
  return digits;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

/* ─────────── In-memory SMS rate-limit ─────────── */
const smsCache = new Map();

function checkRateLimit(mobile) {
  const now = Date.now();
  const prev = smsCache.get(mobile) || { attempts: 0, ts: now };

  if (now - prev.ts > RATE_WINDOW) {
    smsCache.set(mobile, { attempts: 1, ts: now });
    return;
  }
  if (prev.attempts >= MAX_PER_WIN) {
    const wait = Math.ceil((RATE_WINDOW - (now - prev.ts)) / 1_000);
    throw new Error(`Too many OTP requests. Try again in ${wait}s.`);
  }
  prev.attempts += 1;
  smsCache.set(mobile, prev);
}

/* ─────────── SMS Sender ─────────── */
async function sendOtpSms(mobile, otp, purpose = "default") {
  const formatted = formatMobile(mobile);
  checkRateLimit(formatted);

  const message = (SMS_TEMPLATES[purpose] || SMS_TEMPLATES.default)(otp);
  const body = qs.stringify({
    api_key: API_KEY,
    number: formatted,
    message,
    ...(TEMPLATE_ID && { template_id: TEMPLATE_ID }),
  });

  const config = {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: SMS_TIMEOUT,
  };

  for (let attempt = 1; attempt <= SMS_RETRIES + 1; attempt++) {
    try {
      const { data } = await axios.post(WPSENDERS_API_URL, body, config);
      console.log("📨 SMS gateway response →", data);

      const innerErr = data?.response?.ErrorMessage || "";
      if (!data.status || innerErr.toLowerCase().includes("invalid template"))
        throw new Error(innerErr || data.message || "Unknown SMS error");

      return data; // success
    } catch (err) {
      if (attempt > SMS_RETRIES) {
        console.error("❌ SMS failed:", err.message);
        throw new Error("SMS failed: " + err.message);
      }
      await new Promise((r) => setTimeout(r, 1_000 * attempt)); // back-off
    }
  }
}

/* ─────────── Email Sender ─────────── */
async function sendOtpEmail(email, otp, purpose = "default") {
  if (!isValidEmail(email)) throw new Error("Invalid email");

  const transporter = nodemailer.createTransport(SMTP_CONFIG);
  const ctx = purpose === "registration" ? "email verification" : purpose;

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: EMAIL_SUBJECT,
    text: buildEmailText(otp, ctx),
    html: buildEmailHtml(otp, ctx),
  });

  if (!info.messageId) throw new Error("Failed to send OTP email");
  return info;
}

/* ─────────── Exports ─────────── */
module.exports = {
  sendOtpSms,
  sendOtpEmail,
  formatMobile,
  isValidEmail,
};
