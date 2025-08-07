import React from "react";
import { useTranslation } from "react-i18next";

export default function MediaGallery({ business }) {
  const { t } = useTranslation();
  const { logoUrl, bannerUrl, galleryUrls = [] } = business;
  const count = (logoUrl ? 1 : 0) + (bannerUrl ? 1 : 0) + galleryUrls.length;

  return (
    <section className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          🖼️ {t("media.title")}
        </h2>
        <div className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-full text-sm font-medium">
          {count} {t("media.items")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {logoUrl && (
          <ImageCard src={`/uploads/${logoUrl}`} label={t("media.logo")} type="logo" />
        )}
        {bannerUrl && (
          <ImageCard src={`/uploads/${bannerUrl}`} label={t("media.banner")} type="banner" />
        )}
        {galleryUrls.map((url, idx) => (
          <ImageCard
            key={idx}
            src={`/uploads/${url}`}
            label={`${t("media.gallery")} ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function ImageCard({ label, src, type }) {
  const borderColor =
    type === "logo"
      ? "border-blue-200"
      : type === "banner"
      ? "border-purple-200"
      : "border-orange-200";

  return (
    <div
      className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${borderColor} bg-white`}
    >
      <div className="relative overflow-hidden">
        <img
          src={src}
          alt={label}
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-xs text-center py-3 font-bold text-gray-700 bg-gradient-to-r from-gray-50 to-white">
        {label}
      </div>
    </div>
  );
}
