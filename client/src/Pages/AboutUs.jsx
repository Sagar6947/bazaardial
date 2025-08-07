import React from "react";
import { useTranslation } from "react-i18next";
import image1 from "../assets/business.jpg";
import {
  FaSearchLocation,
  FaStore,
  FaUsers,
  FaToolbox,
  FaComments,
  FaHandshake,
} from "react-icons/fa";
import Footer from "../components/Footer";

const Feature = ({ icon, title, desc }) => (
  <div className="flex items-start space-x-4">
    <div className="pt-1">{icon}</div>
    <div>
      <h4 className="font-semibold text-lg text-[#FF6900]">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  </div>
);

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <>
      <section className="bg-white px-6 py-16 md:px-20 text-gray-800">
        <div className="max-w-7xl mx-auto md:flex gap-10 items-stretch">
          {/* Left Column: Image */}
          <div className="flex-1 mb-10 md:mb-0 hidden md:block">
            <div className="h-full max-h-[600px] overflow-hidden rounded-2xl shadow-xl">
              <img
                src={image1}
                alt={t("about.image_alt")}
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </div>

          {/* Right Column: Text */}
          <div className="flex-1 flex flex-col justify-between">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#FF6900] mb-6">
              {t("about.heading")}
            </h1>

            <div className="space-y-5 text-base flex-grow">
              <p>
                <strong className="text-[#FF6900]">{t("about.welcome")}</strong>
                {t("about.desc1")}
              </p>
              <p>{t("about.desc2")}</p>
              <p>{t("about.desc3")}</p>
              <p>{t("about.desc4")}</p>
            </div>

            <div className="text-center font-semibold text-[#FF6900] text-lg mt-6">
              {t("about.closing")}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <Feature
            icon={<FaSearchLocation className="text-2xl text-[#FF6900]" />}
            title={t("about.features.verified_title")}
            desc={t("about.features.verified_desc")}
          />
          <Feature
            icon={<FaToolbox className="text-2xl text-[#FF6900]" />}
            title={t("about.features.tools_title")}
            desc={t("about.features.tools_desc")}
          />
          <Feature
            icon={<FaComments className="text-2xl text-[#FF6900]" />}
            title={t("about.features.reviews_title")}
            desc={t("about.features.reviews_desc")}
          />
          <Feature
            icon={<FaStore className="text-2xl text-[#FF6900]" />}
            title={t("about.features.categories_title")}
            desc={t("about.features.categories_desc")}
          />
          <Feature
            icon={<FaUsers className="text-2xl text-[#FF6900]" />}
            title={t("about.features.community_title")}
            desc={t("about.features.community_desc")}
          />
          <Feature
            icon={<FaHandshake className="text-2xl text-[#FF6900]" />}
            title={t("about.features.connection_title")}
            desc={t("about.features.connection_desc")}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
