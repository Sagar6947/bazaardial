// src/Pages/Dashboard/components/EmptyState.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function EmptyState({ spinner = false }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20 max-w-md">
        {spinner && (
          <div className="relative mb-8">
            <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-amber-400 rounded-full animate-spin animation-delay-150" />
          </div>
        )}
        <div className="text-6xl mb-6">{spinner ? "⏳" : "🏢"}</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          {t("dashboard.loading_title")}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          {t("dashboard.loading_subtitle")}
        </p>
      </div>
    </div>
  );
}
