import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const categories = [
  { key: "civil_contractor", icon: "🏗️" },
  { key: "waterproofing_applicator", icon: "🧰" },
  { key: "plumber", icon: "🚿" },
  { key: "carpenter", icon: "🪚" },
  { key: "painter", icon: "🎨" },
  { key: "borewell_drilling", icon: "🛠️" },
  { key: "electrician", icon: "💡" },
  { key: "solar_panel_installer", icon: "🔋" },
  { key: "real_estate", icon: "🏡" },
  { key: "construction_material_suppliers", icon: "🚧" },
  { key: "cleaning_worker", icon: "🧹" },
  { key: "furniture_contractor", icon: "🪑" },
];

export default function TopCategories() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-orange-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center text-orange-500 mb-12">
          {t("explore_categories")}
        </h2>

        {/* Responsive grid: 2 cols (xs), 4 cols (md and up) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/categories/${category.key.replace(/_/g, "-")}`}
              className="group bg-white rounded-2xl shadow-sm border border-orange-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:scale-[1.03] hover:border-orange-300 transition-all duration-300 ease-in-out"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-3xl">
                {category.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-500">
                {t(`category_names.${category.key}`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
