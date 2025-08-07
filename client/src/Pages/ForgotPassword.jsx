import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [type, setType] = useState("mobile");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const isMobile = (v) => /^[6-9]\d{9}$/.test(v);
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (type === "mobile" && !isMobile(value)) {
      return setError(t("forgot.invalid_mobile"));
    }

    if (type === "email" && !isEmail(value)) {
      return setError(t("forgot.invalid_email"));
    }

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      navigate("/verify-reset-otp", { state: { type, value } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-orange-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 border"
      >
        <h2 className="text-2xl font-bold text-orange-500 text-center">
          {t("forgot.title")}
        </h2>

        <div className="flex justify-center gap-4 text-sm font-medium mb-2">
          <button
            type="button"
            className={`px-4 py-1 rounded-lg border ${
              type === "mobile"
                ? "bg-orange-100 text-orange-600 border-orange-400"
                : "text-gray-500 border-gray-300"
            }`}
            onClick={() => {
              setType("mobile");
              setError("");
              setValue("");
            }}
          >
            {t("forgot.use_mobile")}
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded-lg border ${
              type === "email"
                ? "bg-orange-100 text-orange-600 border-orange-400"
                : "text-gray-500 border-gray-300"
            }`}
            onClick={() => {
              setType("email");
              setError("");
              setValue("");
            }}
          >
            {t("forgot.use_email")}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <input
          type={type === "email" ? "email" : "tel"}
          placeholder={
            type === "mobile"
              ? t("forgot.mobile_placeholder")
              : t("forgot.email_placeholder")
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />

        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full"
        >
          {t("forgot.send_otp")}
        </button>
      </form>
    </div>
  );
}
