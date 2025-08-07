import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo/logo.png";
import { FaX } from "react-icons/fa6";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-gray-800 text-white py-10">
      <div className="w-[90%] max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo and Support Info */}
        <div className="flex flex-col gap-3">
          <img
            src={logo}
            alt="Bazaardial Logo"
            className="w-50 h-15 object-cover"
          />
          <p className="text-gray-400 text-sm">
            {t("footer.support_label")} <br />
            <a 
              href="tel:8085585558" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              aria-label="Call support number"
            >
              8085585558
            </a>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("footer.quick_links")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="text-gray-400 hover:text-white">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-400 hover:text-white">
                {t("about.heading")}
              </Link>
            </li>
            <li>
              <Link
                to="/add-business"
                className="text-gray-400 hover:text-white"
              >
                {t("add_business")}
              </Link>
            </li>
            <li>
              <Link to="/signin" className="text-gray-400 hover:text-white">
                {t("login")}
              </Link>
            </li>
          </ul>
        </div>

        {/* About Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("about.heading")}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t("footer.about_text")}
          </p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("footer.follow_us")}
          </h3>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/share/1Bn76cAF4i/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Facebook"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://x.com/bazaardial76508?t=GIMnnwem4VTC0E6QcbN6Xw&s=08 "
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Twitter"
            >
              <FaX size={20} />
            </a>
            <a
              href="https://www.instagram.com/bazaardial?igsh=MWhoYTZkbndwczk5cA=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Instagram"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/bazaardial-com-061319371?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-wrap justify-center items-center mt-10 text-gray-500 text-sm px-4 gap-2 text-center">
        &copy; {new Date().getFullYear()} Bazaardial. {t("footer.rights")}
        <span className="px-2">|</span>
        <Link
          to="/terms-conditions"
          className="capitalize text-gray-400 hover:text-white"
        >
          Terms & Conditions
        </Link>
        <span className="px-2">|</span>
        <Link
          to="/privacy"
          className="capitalize text-gray-400 hover:text-white"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
