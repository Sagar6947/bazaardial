import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiPhone,
  FiKey,
  FiEye,
  FiEyeOff,
  FiMail,
} from "react-icons/fi";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';

/* ─── Generic text input ─── */
function TextField({ icon, children, className = "", ...props }) {
  return (
    <div
      className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 ${className}`}
    >
      <span className="text-gray-400 mr-2">{icon}</span>
      <input className="w-full outline-none placeholder-gray-400" {...props} />
      {children}
    </div>
  );
}

/* ─── Password field with eye toggle ─── */
function PasswordField({ icon, value, onChange, show, toggle, placeholder }) {
  return (
    <TextField
      icon={icon}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="new-password"
      required
    >
      <button
        type="button"
        onClick={toggle}
        className="text-gray-400 ml-2"
        aria-label="Toggle password visibility"
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </TextField>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, token, ready } = useContext(AuthContext);

  /* ─── Form state ─── */
  const [form, setForm] = useState({
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [via, setVia] = useState("mobile"); // "mobile" | "email"
  const [step, setStep] = useState("register"); // "register" | "verify"

  const [show, setShow] = useState({ pwd: false, confirm: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  /* ─── Username availability ─── */
  const [userStatus, setUserStatus] = useState({
    available: null,
    checking: false,
    message: "",
  });

  /* ─── Redirect if already logged in ─── */
  useEffect(() => {
    if (ready && token) navigate("/", { replace: true });
  }, [token, ready, navigate]);

  const upd = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (error) setError("");
  };

  const isValidEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

  /* ─── Username check (debounced) ─── */
  const checkUsername = useCallback(
    async (name) => {
      if (name.length < 3) {
        setUserStatus({ available: null, checking: false, message: "" });
        return;
      }
      try {
        setUserStatus({ available: null, checking: true, message: "" });
        await axios.get("/api/auth/check-username", {
          params: { username: name },
        });
        setUserStatus({
          available: true,
          checking: false,
          message: t("register.username_available"),
        });
      } catch (e) {
        setUserStatus({
          available: false,
          checking: false,
          message:
            e.response?.status === 409
              ? t("register.username_taken")
              : t("register.username_check_fail"),
        });
      }
    },
    [t]
  );

  useEffect(() => {
    const id = setTimeout(() => checkUsername(form.username.trim()), 400);
    return () => clearTimeout(id);
  }, [form.username, checkUsername]);

  /* ─── Resend-OTP countdown ─── */
  useEffect(() => {
    if (!resendSeconds) return;
    const id = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendSeconds]);

  /* ─── Client-side validation ─── */
  const validate = () => {
    const { username, password, confirmPassword, mobile, email } = form;

    if (!username || !password || !confirmPassword)
      return t("register.all_required");
    if (username.length < 3) return t("register.username_short");

    if (via === "mobile") {
      if (!/^\d{10}$/.test(mobile)) return t("register.mobile_invalid");
    } else {
      if (!isValidEmail(email)) return t("register.email_invalid");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password))
      return t("register.password_weak");
    if (password !== confirmPassword) return t("register.password_mismatch");
    if (userStatus.checking) return t("register.username_checking");
    if (userStatus.available === false) return userStatus.message;

    return null;
  };

  /* ─── Submit: Register ─── */
  const handleRegister = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      const payload = {
        username: form.username.trim(),
        password: form.password,
        ...(via === "mobile" ? { mobile: form.mobile } : { email: form.email }),
      };

      await axios.post("/api/auth/register", payload);
      setResendSeconds(60);
      setStep("verify");
      setSuccess(t("register.otp_sent"));
    } catch (err) {
      setError(err.response?.data?.message || t("register.failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ─── Submit: Verify OTP ─── */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(form.otp)) return setError(t("register.otp_invalid"));

    try {
      setLoading(true);
      const endpoint =
        via === "mobile"
          ? "/api/auth/verify-otp"
          : "/api/auth/verify-email-otp";
      const payload =
        via === "mobile"
          ? { mobile: form.mobile, otp: form.otp }
          : { email: form.email, otp: form.otp };

      const { data } = await axios.post(endpoint, payload);
      login(data.accessToken);
      toast.success("User registered successfully!")
      navigate("/add-business", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t("register.otp_failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ─── Resend OTP ─── */
  const resendOtp = async () => {
    try {
      setLoading(true);
      await axios.post("/api/auth/resend-otp", {
        contact: via === "mobile" ? form.mobile : form.email,
        via,
      });
      setResendSeconds(60);
      setSuccess(t("register.otp_resent"));
    } catch (err) {
      setError(err.response?.data?.message || t("register.otp_resend_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  /* ─────────────────── UI ─────────────────── */
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-orange-100 mt-10 mb-6">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-orange-500 mb-1 text-center">
          {step === "register" ? t("register.heading") : t("register.verify")}
        </h2>
        <p className="text-center text-sm mb-6 text-gray-600">
          {step === "register"
            ? t("register.subheading")
            : t("register.otp_subheading", {
                contact: via === "mobile" ? form.mobile : form.email,
              })}
        </p>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {/* STEP 1 — REGISTER */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <TextField
              icon={<FiUser />}
              placeholder={t("register.username")}
              value={form.username}
              onChange={upd("username")}
              required
            />
            {userStatus.checking && (
              <p className="text-xs text-gray-500">{t("register.checking")}</p>
            )}
            {userStatus.available && (
              <p className="text-xs text-green-600">
                ✓ {t("register.available")}
              </p>
            )}
            {userStatus.available === false && (
              <p className="text-xs text-red-600">{userStatus.message}</p>
            )}

            {/* Switch mobile / email */}
            <div className="flex justify-between mb-1">
              <p className="text-sm font-medium text-gray-600">
                {t("register.choose_method")}
              </p>
              <button
                type="button"
                onClick={() =>
                  setVia((v) => (v === "mobile" ? "email" : "mobile"))
                }
                className="text-orange-500 text-sm hover:underline"
              >
                {via === "mobile"
                  ? t("register.use_email")
                  : t("register.use_mobile")}
              </button>
            </div>

            {/* Contact input */}
            {via === "mobile" ? (
              <TextField
                icon={<FiPhone />}
                placeholder={t("register.mobile")}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) =>
                  /^\d{0,10}$/.test(e.target.value) ? upd("mobile")(e) : null
                }
                required
              />
            ) : (
              <TextField
                icon={<FiMail />}
                placeholder={t("register.email")}
                type="email"
                value={form.email}
                onChange={upd("email")}
                required
              />
            )}

            {/* Password / confirm */}
            <PasswordField
              icon={<FiLock />}
              value={form.password}
              onChange={upd("password")}
              show={show.pwd}
              toggle={() => setShow((s) => ({ ...s, pwd: !s.pwd }))}
              placeholder={t("register.password")}
            />
            <PasswordField
              icon={<FiKey />}
              value={form.confirmPassword}
              onChange={upd("confirmPassword")}
              show={show.confirm}
              toggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
              placeholder={t("register.confirm_password")}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? t("register.registering") : t("register.register")}
            </button>
          </form>
        )}

        {/* STEP 2 — VERIFY OTP */}
        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <TextField
              icon={<FiLock />}
              placeholder={t("register.otp")}
              maxLength={5}
              type="tel"
              inputMode="numeric"
              value={form.otp}
              onChange={upd("otp")}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? t("register.verifying") : t("register.verify_button")}
            </button>
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading || resendSeconds > 0}
              className="w-full mt-2 text-orange-600 hover:underline text-center disabled:opacity-50"
            >
              {resendSeconds > 0
                ? t("register.resend_wait", { seconds: resendSeconds })
                : t("register.resend_otp")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
