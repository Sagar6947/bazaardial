import React from "react";
import { useTranslation } from "react-i18next";

export default function HeroHeader({ business }) {
  const { t } = useTranslation();

  const categoryKey = business.category?.replace(/ /g, "_").toLowerCase();

  return (
    <header className="text-center space-y-6 py-12">
      <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-orange-100">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-green-700">
          {t("dashboard.active_status")}
        </span>
      </div>

      <h1 className="text-6xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-orange-800 bg-clip-text text-transparent leading-tight">
        {business.businessName}
      </h1>

      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300">
          ✨ {t(`category_names.${categoryKey}`)}
        </div>
      </div>
    </header>
  );
}
