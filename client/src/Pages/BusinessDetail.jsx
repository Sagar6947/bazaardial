import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaClock,
  FaRegIdCard,
  FaBuilding,
} from "react-icons/fa";
import { FaYoutube, FaXTwitter } from "react-icons/fa6";
import Footer from "../components/Footer";
import CallToAction from "../components/CallToAction";

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");


export default function BusinessDetail() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const lightboxRef = useRef();

  // Always define galleryUrls for use in effects
  const galleryUrls = business?.galleryUrls || [];

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`/api/business`);
        const match = res.data.find(
          (item) => slugify(item.businessName) === slug
        );
        if (!match || !match.businessName) {
          setError(t("featured.error"));
        } else {
          setBusiness(match);
        }
      } catch (err) {
        setError(t("featured.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug, t]);

  // Keyboard and swipe handlers for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && galleryUrls && lightboxIndex > 0) setLightboxIndex((i) => i - 1);
      if (e.key === "ArrowRight" && galleryUrls && lightboxIndex < galleryUrls.length - 1) setLightboxIndex((i) => i + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, galleryUrls]);

  // Basic swipe support
  useEffect(() => {
    if (lightboxIndex === null) return;
    let startX = null;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (dx > 50 && lightboxIndex > 0) setLightboxIndex((i) => i - 1);
      if (dx < -50 && galleryUrls && lightboxIndex < galleryUrls.length - 1) setLightboxIndex((i) => i + 1);
      startX = null;
    };
    const node = lightboxRef.current;
    if (node) {
      node.addEventListener("touchstart", handleTouchStart);
      node.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      if (node) {
        node.removeEventListener("touchstart", handleTouchStart);
        node.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [lightboxIndex, galleryUrls]);

  if (loading)
    return (
      <div className="text-center mt-20 text-lg">{t("featured.loading")}</div>
    );
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  const {
    businessName,
    category,
    fullDesc,
    city,
    state,
    primaryPhone,
    secondaryPhone,
    experience,
    street,
    zipCode,
    openingHour,
    closingHour,
    registrationNumber,
    gstin,
    websiteUrl,
    facebookUrl,
    whatsappUrl,
    instagramUrl,
    linkedinUrl,
    youtubeUrl,
    xUrl,
    logoUrl,
    bannerUrl,
  } = business;

  return (
    <>
      <div className="w-full min-h-screen bg-orange-50">
        <div
          className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/uploads/${bannerUrl})`,
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold">{businessName}</h1>
            <p className="mt-2 text-lg">{category}</p>
          </div>
        </div>

        <div className="w-[90%] max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center md:items-start">
            <img
              src={`/uploads/${logoUrl}`}
              alt={businessName}
              className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full object-cover mx-auto mb-4 shadow"
            />
            <h2 className="text-xl font-semibold text-orange-500 text-center md:text-left">
              {businessName}
            </h2>
            <p className="text-gray-500 text-center md:text-left">{category}</p>
            <div className="mt-4 text-gray-700 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt /> {street}, {city}, {state} - {zipCode}
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt /> {primaryPhone}
              </p>
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 mx-auto inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
              >
                <FaWhatsapp /> {t("contact.whatsapp")}
              </a>
            )}
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-orange-500">
                {t("about.heading")}
              </h3>
              <p className="text-gray-700 leading-relaxed">{fullDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <FaClock /> {t("detail.working_hours")}: {openingHour} -{" "}
                {closingHour}
              </p>
              <p className="flex items-center gap-2">
                <FaClock /> {t("detail.experience")}: {experience}
              </p>
              {secondaryPhone && (
                <p className="flex items-center gap-2">
                  <FaPhoneAlt /> {t("detail.alternate")}: {secondaryPhone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <FaRegIdCard /> {t("detail.registration")}: {registrationNumber}
              </p>
              <p className="flex items-center gap-2">
                <FaBuilding /> {t("detail.gstin")}: {gstin}
              </p>
              <p className="flex items-center gap-2">
                <FaGlobe />
                {websiteUrl ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {websiteUrl}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">
                    {t("featured.no_website")}
                  </span>
                )}
              </p>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-1">
                {t("detail.connect")}
              </h4>
              <div className="flex gap-4 flex-wrap bg-gray-100 rounded-lg p-4 shadow-inner">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition duration-200 shadow"
                  >
                    <FaFacebookF />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-500 hover:text-white transition duration-200 shadow"
                  >
                    <FaInstagram />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-600 hover:text-white transition duration-200 shadow"
                  >
                    <FaLinkedinIn />
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition duration-200 shadow"
                  >
                    <FaYoutube />
                  </a>
                )}
                {xUrl && (
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition duration-200 shadow"
                  >
                    <FaXTwitter />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {galleryUrls && galleryUrls.length > 0 && (
          <div className="w-full bg-orange-100 mt-16 py-10">
            <div className="w-full mx-auto px-6">
              <h3 className="text-3xl text-orange-500 text-center font-bold mb-6 border-b border-orange-300 pb-2">
                {t("detail.gallery")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryUrls.map((img, index) => (
                  <img
                    key={index}
                    src={`../uploads/${img}`}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow hover:scale-105 transition-transform duration-200 cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Lightbox overlay */}
        {lightboxIndex !== null && galleryUrls && (
          <div
            ref={lightboxRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-all"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxIndex(null);
            }}
            style={{ touchAction: "pan-y" }}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
            >
              ×
            </button>
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => i - 1);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            <img
              src={`../uploads/${galleryUrls[lightboxIndex]}`}
              alt={`Gallery ${lightboxIndex + 1}`}
              className="w-screen h-screen object-contain rounded-lg shadow-2xl m-0"
              style={{ maxWidth: '100vw', maxHeight: '100vh', boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}
            />
            {galleryUrls && lightboxIndex < galleryUrls.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => i + 1);
                }}
                aria-label="Next"
              >
                ›
              </button>
            )}
          </div>
        )}
      </div>
      <CallToAction />
      <Footer />
    </>
  );
}
