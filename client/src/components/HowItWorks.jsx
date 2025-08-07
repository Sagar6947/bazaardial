import React from "react";
import { FiTrendingUp, FiPhone, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token in HowItWorks.jsx", err);
    }
  }

  const handleBusinessClick = () => {
    if (!token) {
      navigate("/signin", { state: { from: { pathname: "/add-business" } } });
    } else if (role === "user") {
      navigate("/add-business");
    } else if (role === "owner") {
      alert(t("howitworks.already_listed_alert"));
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="w-full bg-orange-100 py-16">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-10">
        {t("howitworks.title")}
      </h2>

      <div className="w-[90%] mx-auto flex flex-col sm:flex-row justify-between items-center space-y-10 sm:space-y-0 sm:space-x-10">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center w-full sm:w-[30%]">
          <FiTrendingUp className="text-5xl mb-4 text-blue-600" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            {t("howitworks.step1_title")}
          </h3>
          <p className="text-gray-600 font-medium">
            {t("howitworks.step1_desc")}
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center w-full sm:w-[30%]">
        <a href="tel:8085585558" className="flex flex-col items-center text-center w-full">
          <FiPhone className="text-5xl mb-4 text-green-600" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {t("howitworks.step2_title")}
          </h3>
          <p className="text-gray-600 font-medium">
            {t("howitworks.step2_desc")}
          </p>
        </a>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center w-full sm:w-[30%]">
          <FiClock className="text-5xl mb-4 text-red-600" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            {t("howitworks.step3_title")}
          </h3>
          <p className="text-gray-600 font-medium">
            {t("howitworks.step3_desc")}{" "}
            <span
              className="underline cursor-pointer text-red-700 hover:text-red-900 transition font-semibold"
              onClick={handleBusinessClick}
            >
              {t("howitworks.step3_button")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
