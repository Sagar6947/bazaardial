import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const slugify = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function FeaturedBusinesses() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/api/business");

        if (Array.isArray(res.data)) {
          setBusinesses(res.data);
        } else if (Array.isArray(res.data.businesses)) {
          setBusinesses(res.data.businesses);
        } else if (Array.isArray(res.data.data)) {
          setBusinesses(res.data.data);
        } else {
          console.warn("❌ Unexpected response format:", res.data);
          setBusinesses([]);
        }
      } catch (err) {
        console.error("❌ Error fetching businesses:", err);
        setError(t("featured.error"));
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [t]);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">
        {t("featured.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        {t("featured.empty")}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-orange-50 py-16">
      <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">
        🌟 {t("featured.title")}
      </h2>

      <div className="w-[90%] max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {businesses
          .reverse()
          .slice(0, 9)
          .map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    item.logoUrl?.startsWith("http")
                      ? item.logoUrl
                      : `/uploads/${item.logoUrl}`
                  }
                  alt={item.businessName || "Business"}
                  className="w-[60px] h-[60px] rounded-full object-cover border shadow"
                />
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1 text-gray-800">
                    {item.businessName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {item.city || t("featured.city")},{" "}
                    {item.state || t("featured.state")}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-orange-500 font-medium mb-1">
                  {item.category}
                </p>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {item.shortDesc}
                </p>
                <p className="text-gray-500 text-xs mt-2">{item.primaryPhone}</p>
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t">
                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline text-sm"
                  >
                    {t("featured.website")}
                  </a>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    {t("featured.no_website")}
                  </span>
                )}

                <Link
                  to={`/business/${slugify(item.businessName)}`}
                  className="bg-orange-500 text-white px-3 py-1.5 text-sm rounded hover:bg-orange-600 transition"
                >
                  {t("featured.details")}
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
