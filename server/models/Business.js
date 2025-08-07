const mongoose = require("mongoose");

const phone10 = /^\d{10}$/;
const time24h = /^([01]\d|2[0-3]):[0-5]\d$/;
const urlHttp = /^https?:\/\/.+/i;

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Civil Contractor",
        "Waterproofing Applicator",
        "Plumber",
        "Carpenter",
        "Painter",
        "Borewell Drilling",
        "Electrician",
        "Solar Panel Installer",
        "Real Estate",
        "Construction Material Suppliers",
        "Cleaning Worker",
        "Furniture Contractor",
      ],
    },
    primaryPhone: { type: String, required: true, match: phone10 },
    secondaryPhone: { type: String, match: phone10 },

    experience: {
      type: String,
      required: true,
      enum: ["0-1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"],
    },

    shortDesc: { type: String, required: true },
    fullDesc: { type: String, required: true },

    logoUrl: { type: String },
    bannerUrl: { type: String },
    aadharUrl: { type: String },

    galleryUrls: {
      type: [String],
      default: [],
      validate: (v) => v.every((u) => typeof u === "string"),
    },

    websiteUrl: { type: String, match: urlHttp },
    facebookUrl: { type: String, match: urlHttp },
    whatsappUrl: { type: String, match: urlHttp },
    instagramUrl: { type: String, match: urlHttp },
    linkedinUrl: { type: String, match: urlHttp },
    youtubeUrl: { type: String, match: urlHttp },
    xUrl: { type: String, match: urlHttp },

    street: { type: String, required: true },
    landmark: { type: String },
    locality: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },

    openingHour: { type: String, required: true, match: time24h },
    closingHour: { type: String, required: true, match: time24h },

    registrationNumber: { type: String },
    gstin: { type: String },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// enforce one-business-per-user
businessSchema.index({ ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Business", businessSchema);
