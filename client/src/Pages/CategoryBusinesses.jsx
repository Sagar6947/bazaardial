import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import slugify from "../utils/slugify";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

export default function CategoryBusinesses() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState("");

  const categoryKey = slug.replace(/-/g, "_");
  const categoryName = t(`category_names.${categoryKey}`);

  const areaList = [
    "Rau",
    "Silicon City",
    "Rajendra Nagar",
    "Choithram mandi",
    "Bhawarkua Square",
    "Navlakha Square",
    "Geeta Bhawan",
    "Palasia",
    "LIG Square",
    "Vijay Nagar",
    "Dewas Naka",
    "Mangaliya",
    "Mhow Naka",
    "Chandan Nagar",
    "Hawa Bangla",
    "Bada ganpati",
    "Mari Mata",
    "Kalani Nagar",
    "Gandhi Nagar",
    "Chota Bangarda",
    "Near Aurobindo",
    "MR 10",
    "Tejaji Nagar",
    "Musakhedi",
    "Bangali Square",
    "Khajrana Square",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/business");
        const all = res.data;
        const filtered = all.filter((b) => slugify(b.category) === slug);
        setBusinesses(filtered);
        setSelectedArea(""); // reset filter on category change
      } catch (err) {
        console.error("Failed to fetch businesses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // filter by area
  const visibleBusinesses = selectedArea
    ? businesses.filter((b) => b.locality === selectedArea)
    : businesses;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 py-16 px-4 sm:py-20 sm:px-6 lg:py-24 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-orange-600/90"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {categoryName}
            </h1>
            <p className="text-orange-100 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto">
              {t("category.discover_businesses", "Discover the best businesses in your area")}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        </div>

        {/* Main Content */}
        <div className="relative -mt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    📍 {t("category.filter_by_area", "Filter by Area")}
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">{t("category.all_areas", "All Areas")}</option>
                    {areaList.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="font-semibold">{visibleBusinesses.length}</span>
                  <span>{t("category.businesses_found", "businesses found")}</span>
                </div>
              </div>
            </div>

            {/* Business Cards */}
            {visibleBusinesses.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl sm:text-7xl mb-6">🔍</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    {t("category.no_businesses_title", "No businesses found")}
                  </h3>
                  <p className="text-gray-600 text-base sm:text-lg">
                    {t(
                      "category.no_businesses",
                      "No businesses found in this category or area."
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {visibleBusinesses.map((b, index) => (
                  <div
                    key={b._id}
                    className="group bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={
                              b.logoUrl
                                ? b.logoUrl.startsWith("http")
                                  ? b.logoUrl
                                  : `/uploads/${b.logoUrl}`
                                : "/default-logo.png"
                            }
                            alt={b.businessName || "Business"}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-gray-100 shadow-sm group-hover:shadow-md transition-shadow"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {b.businessName}
                          </h3>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <span>📍</span>
                            <span className="truncate">
                              {b.locality && `${b.locality}, `}
                              {b.city || t("featured.city")}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                          {t(
                            `category_names.${b.category
                              .replace(/ /g, "_")
                              .toLowerCase()}`
                          )}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                        {b.shortDesc || t("featured.no_description")}
                      </p>

                      {/* Contact Info */}
                      {b.primaryPhone && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                          <span>📞</span>
                          <span className="font-medium">{b.primaryPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-4 border-t border-gray-100">
                        {b.websiteUrl ? (
                          <a
                            href={b.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                          >
                            <span>🌐</span>
                            <span>{t("featured.website")}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-sm">
                            {t("featured.no_website")}
                          </span>
                        )}

                        <Link
                          to={`/business/${slugify(b.businessName)}`}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <span>{t("featured.details")}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <CallToAction />
      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}