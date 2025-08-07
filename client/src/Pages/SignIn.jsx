import React, { useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function TextField({ icon, className = "", ...props }) {
  return (
    <div
      className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 ${className}`}
    >
      <span className="text-gray-400 mr-2">{icon}</span>
      <input className="w-full outline-none placeholder-gray-400" {...props} />
    </div>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const { login, token, ready } = useContext(AuthContext);
  const { t } = useTranslation();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ready) return null;
  if (token) {
    navigate("/", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const isMobile = (str) => /^[6-9]\d{9}$/.test(str);
  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { identifier, password } = form;
    if (!identifier.trim() || !password.trim()) {
      return setError(t("signin.required"));
    }

    if (/^\d+$/.test(identifier) && !isMobile(identifier)) {
      return setError(t("signin.mobile_invalid"));
    }

    if (identifier.includes("@") && !isEmail(identifier)) {
      return setError(t("signin.email_invalid"));
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("signin.login_failed"));

      login(data.accessToken);
      const { role } = jwtDecode(data.accessToken);
      navigate(role === "user" ? "/add-business" : "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEADB] to-[#FFD9B8] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-orange-300 mt-10 mb-6">
        <h2 className="text-3xl font-bold text-center text-[#e26936] mb-6">
          {t("signin.title")}
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            icon={<FiUser />}
            id="identifier"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder={t("signin.identifier_placeholder")}
            autoComplete="username"
          />

          <TextField
            icon={<FiLock />}
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("signin.password_placeholder")}
            autoComplete="current-password"
          />

          <div className="flex justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-orange-500 hover:underline"
            >
              {t("signin.forgot_password")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e26936] hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? t("signin.signing_in") : t("signin.signin")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("signin.no_account")}{" "}
          <Link to="/register" className="text-[#e26936] hover:underline">
            {t("signin.create_one")}
          </Link>
        </p>
      </div>
    </div>
  );
}
