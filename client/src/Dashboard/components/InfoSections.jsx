import React from "react";
import { useTranslation } from "react-i18next";

export default function InfoSections({ business }) {
  const { t } = useTranslation();
  const {
    experience,
    primaryPhone,
    secondaryPhone,
    whatsappUrl,
    websiteUrl,
    openingHour,
    closingHour,
    street,
    locality,
    landmark,
    city,
    state,
    zipCode,
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    youtubeUrl,
    xUrl,
    registrationNumber,
    gstin,
  } = business;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Section
            title={`📋 ${t("detail_section.business_info")}`}
            gradient="from-blue-600 to-purple-600"
          >
            <InfoItem
              label={t("detail.experience")}
              value={experience}
              icon="⭐"
            />
            <InfoItem
              label={t("detail.primary_phone")}
              value={primaryPhone}
              icon="📞"
            />
            <InfoItem
              label={t("detail.alternate_phone")}
              value={secondaryPhone || "—"}
              icon="📱"
            />
            <InfoItem
              label={t("detail.whatsapp")}
              value={whatsappUrl}
              icon="💬"
            />
            <InfoItem
              label={t("detail.website")}
              value={websiteUrl}
              icon="🌐"
            />
            <InfoItem
              label={t("detail.timings")}
              value={`${openingHour} – ${closingHour}`}
              icon="🕐"
            />
          </Section>

          <Section
            title={`📍 ${t("detail_section.address_details")}`}
            gradient="from-green-600 to-teal-600"
          >
            <InfoItem label={t("detail.street")} value={street} icon="🏠" />
            <InfoItem
              label={t("detail.locality")}
              value={locality || "—"}
              icon="🏘️"
            />
            <InfoItem
              label={t("detail.landmark")}
              value={landmark || "—"}
              icon="📍"
            />
            <InfoItem label={t("detail.city")} value={city} icon="🏙️" />
            <InfoItem label={t("detail.state")} value={state} icon="🗺️" />
            <InfoItem label={t("detail.zip_code")} value={zipCode} icon="📮" />
          </Section>
        </div>

        <div className="space-y-6">
          <Section
            title={`🔗 ${t("detail_section.social_presence")}`}
            gradient="from-pink-600 to-rose-600"
          >
            <InfoItem
              label={t("detail.facebook")}
              value={facebookUrl || "—"}
              icon="📘"
            />
            <InfoItem
              label={t("detail.instagram")}
              value={instagramUrl || "—"}
              icon="📷"
            />
            <InfoItem
              label={t("detail.linkedin")}
              value={linkedinUrl || "—"}
              icon="💼"
            />
            <InfoItem
              label={t("detail.youtube")}
              value={youtubeUrl || "—"}
              icon="📺"
            />
            <InfoItem label={t("detail.x")} value={xUrl || "—"} icon="🐦" />
          </Section>

          <Section
            title={`📄 ${t("detail_section.legal_info")}`}
            gradient="from-amber-600 to-orange-600"
          >
            <InfoItem
              label={t("detail.registration_number")}
              value={registrationNumber || "—"}
              icon="📋"
            />
            <InfoItem
              label={t("detail.gstin")}
              value={gstin || "—"}
              icon="🏛️"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, gradient }) {
  return (
    <div className="group">
      <h3
        className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-4`}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-white/70 transition-all duration-300 border border-gray-100/50 hover:border-orange-200">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide block">
          {label}
        </span>
        <span className="text-sm text-gray-800 font-medium truncate block">
          {value}
        </span>
      </div>
    </div>
  );
}
