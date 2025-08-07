import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyResetOtp() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [state.type]: state.value, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      navigate("/reset-password", { state: { token: data.token } });
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
          {t("verify.title")}
        </h2>

        <p className="text-sm text-gray-500 text-center mb-2">
          {t("verify.subtitle", {
            type: t(`verify.${state.type}`),
            value: state.value,
          })}
        </p>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <input
          type="text"
          placeholder={t("verify.otp_placeholder")}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
          maxLength={5}
        />

        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full"
        >
          {t("verify.button")}
        </button>
      </form>
    </div>
  );
}
