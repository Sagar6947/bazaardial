import React from "react";
import { useTranslation } from "react-i18next";

export default function QuickActions({ onEdit, onDelete }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <ActionButton onClick={onEdit} color="orange" icon="✏️">
        {t("dashboard.edit_button")}
      </ActionButton>
      <ActionButton onClick={onDelete} color="red" icon="❌">
        {t("dashboard.delete_button")}
      </ActionButton>
    </div>
  );
}

function ActionButton({ onClick, color = "orange", icon, children }) {
  const colorClasses = {
    orange:
      "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200",
    red: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-200",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${colorClasses[color]} shadow-lg`}
    >
      <span className="text-lg">{icon}</span>
      {children}
    </button>
  );
}
