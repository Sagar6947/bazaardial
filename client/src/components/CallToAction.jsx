import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";

export default function CallToAction() {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (role === "guest") {
      navigate("/signin");
    } else if (role === "user") {
      navigate("/add-business");
    } else if (role === "owner") {
      alert(t("cta.already_listed_alert"));
    }
  };

  return (
    <div className="w-full bg-orange-500 text-white py-20">
      <div className="w-[90%] mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          {t("cta.heading")}
        </h2>
        <p className="text-lg mb-8">
          {t("cta.subtext")}
        </p>
        <button
          onClick={handleClick}
          className="bg-white text-orange-500 px-6 py-3 rounded-md text-xl font-semibold transition hover:bg-orange-100"
        >
          {t("cta.button")}
        </button>
      </div>
    </div>
  );
}
