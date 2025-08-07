// components/FloatingListButton.jsx
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";

export default function FloatingListButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------- role / token logic ---------- */
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    try {
      role = jwtDecode(token).role;
    } catch (_) {
      console.error("Invalid JWT in FloatingListButton");
    }
  }

  const handleClick = () => {
    if (!token) {
      navigate("/signin", { state: { pathname: "/add-business" } });
    } else if (role === "user") {
      navigate("/add-business");
    } else if (role === "owner") {
      alert(t("howitworks.already_listed_alert"));
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[60] group">
      {/* Tooltip with urgency message */}
      <div
        className="
        absolute bottom-full left-0 mb-3
        px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
        whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity duration-300 pointer-events-none
        shadow-lg
        before:absolute before:top-full before:left-4
        before:border-4 before:border-transparent before:border-t-gray-900
      "
      >
        🚀 List your business now - Limited spots!
      </div>

      <button
        onClick={handleClick}
        title={t("list_button_label")}
        aria-label={t("list_button_label")}
        className="
          flex items-center justify-center
          w-14 h-14 md:w-16 md:h-16
          rounded-full bg-orange-500 hover:bg-orange-600
          text-white shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-orange-300/50
          border border-orange-400/30
        "
      >
        <FaPlus
          className="
            w-5 h-5 md:w-6 md:h-6
            transition-transform duration-200
            group-hover:rotate-90
          "
        />

        <span className="sr-only">{t("list_button_label")}</span>
      </button>

      {/* Pulsing ring for attention */}
      <div
        className="
        absolute inset-0 rounded-full
        border-2 border-orange-400/40
        animate-ping
        pointer-events-none
      "
      />
    </div>
  );
}
