import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return setError(t("reset.invalid_password"));
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: state.token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(t("reset.success"));
      navigate("/signin");
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
          {t("reset.title")}
        </h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <input
          type="password"
          placeholder={t("reset.placeholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full"
        >
          {t("reset.button")}
        </button>
      </form>
    </div>
  );
}
