const Business = require("../models/Business");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { signTokens } = require("../utils/jwtHelper");
const fs = require("fs");
const path = require("path");

const phone10 = /^\d{10}$/;
const time24 = /^(0?\d|1\d|2[0-3]):[0-5]\d$/;

function rmTmpFiles(files) {
  if (!files) return;
  Object.values(files)
    .flat()
    .forEach((f) => {
      try {
        if (f?.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      } catch (_) {}
    });
}

// ───────────────────────────────────────────────
// server/controllers/businessController.js   (or wherever you defined it)

/* GET  /api/business
   ─────────────────────────────────────────
   • q      – optional text to search inside businessName  (case-insensitive)
   • limit  – optional max #docs to return   (default 50, hard-capped at 100)
*/
const getBusinesses = async (req, res) => {
  try {
    const { q = "", limit = 50 } = req.query;

    /* build Mongo filter only when a search term is present */
    const filter = q.trim()
      ? { businessName: { $regex: q.trim(), $options: "i" } }
      : {};
    
    const docs = await Business.find(filter)
      .sort({ createdAt: -1 }) // newest first (optional)
      .limit(Math.min(+limit, 100)) // safety cap
      .lean();

    res.json(docs);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
};

module.exports = { getBusinesses /*, …the rest of your handlers */ };

// ───────────────────────────────────────────────
const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user.uid });
    if (!business) return res.status(404).json({ message: "Not found" });
    res.json(business);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
};

// ───────────────────────────────────────────────
const createBusiness = async (req, res) => {
  try {
    /* ───── 1. Auth header ------------------------------------------------ */
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    /* ───── 2. Verify access-token & user -------------------------------- */
    let user;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.uid);

      /* FIX ① — accept mobile-OR-email verified */
      if (!user || (!user.isVerified && !user.isEmailVerified))
        throw new Error();
    } catch {
      rmTmpFiles(req.files);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    /* one-business-per-user rule */
    if (await Business.findOne({ ownerId: user._id })) {
      rmTmpFiles(req.files);
      return res
        .status(403)
        .json({ message: "Only one business allowed per user" });
    }

    /* ───── 3. Basic field validation ------------------------------------ */
    const required = [
      "businessName",
      "category",
      "primaryPhone",
      "experience",
      "shortDesc",
      "fullDesc",
      "street",
      "city",
      "state",
      "zipCode",
      "openingHour",
      "closingHour",
      "whatsappUrl",
    ];
    const missing = required.filter((k) => !req.body[k]);
    if (missing.length || !req.files?.aadhar) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: `Missing: ${missing.join(", ") || "aadhar image"}` });
    }

    const {
      category,
      experience,
      primaryPhone,
      secondaryPhone,
      openingHour,
      closingHour,
      whatsappUrl,
    } = req.body;

    const allowedCat = [
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
    ];
    const allowedExp = [
      "0-1 year",
      "1-2 years",
      "2-5 years",
      "5-10 years",
      "10+ years",
    ];

    if (!allowedCat.includes(category) || !allowedExp.includes(experience)) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: "Invalid category or experience" });
    }

    if (
      !phone10.test(primaryPhone) ||
      (secondaryPhone && !phone10.test(secondaryPhone))
    ) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: "Phone numbers must be 10 digits" });
    }

    if (!phone10.test(whatsappUrl)) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: "WhatsApp number must be 10 digits" });
    }

    if (!time24.test(openingHour) || !time24.test(closingHour)) {
      rmTmpFiles(req.files);
      return res.status(400).json({ message: "Time must be in HH:mm format" });
    }

    if (await Business.exists({ primaryPhone })) {
      rmTmpFiles(req.files);
      return res
        .status(409)
        .json({ message: "Business with this phone already exists" });
    }

    /* ───── 4. Build document ------------------------------------------- */
    const data = {
      ...req.body,
      ownerId: user._id,
      primaryPhone,
      secondaryPhone,
      openingHour,
      closingHour,
      category,
      experience,
    };

    if (whatsappUrl && phone10.test(whatsappUrl))
      data.whatsappUrl = `https://wa.me/91${whatsappUrl}`;

    if (req.files?.logo) data.logoUrl = req.files.logo[0].filename;
    if (req.files?.banner) data.bannerUrl = req.files.banner[0].filename;
    if (req.files?.aadhar) data.aadharUrl = req.files.aadhar[0].filename;
    if (req.files?.gallery)
      data.galleryUrls = req.files.gallery.map((f) => f.filename);

    const biz = await Business.create(data);

    /* ───── 5. Promote user to "owner" ---------------------------------- */
    if (user.role !== "owner") {
      await User.findByIdAndUpdate(user._id, {
        role: "owner",
        businessId: biz._id,
      });
    }

    const updatedUser = await User.findById(user._id);
    const { accessToken, refreshToken } = signTokens(updatedUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    /* FIX ② — return the token field your front-end expects */
    return res.status(201).json({
      message: "Business created",
      business: biz,
      accessToken, // ← renamed from token → accessToken
    });
  } catch (err) {
    console.error("Create error", err.message);
    rmTmpFiles(req.files);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ───────────────────────────────────────────────
const updateBusiness = async (req, res) => {
  try {
    if (!req.user?.uid)
      return res.status(401).json({ message: "Unauthorized" });

    const business = await Business.findOne({
      _id: req.params.id,
      ownerId: req.user.uid,
    });
    if (!business) {
      rmTmpFiles(req.files);
      return res.status(404).json({ message: "Business not found" });
    }

    const {
      category,
      experience,
      primaryPhone,
      secondaryPhone,
      openingHour,
      closingHour,
      whatsappUrl,
    } = req.body;

    const allowedCat = [
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
    ];
    const allowedExp = [
      "0-1 year",
      "1-2 years",
      "2-5 years",
      "5-10 years",
      "10+ years",
    ];

    if (
      (category && !allowedCat.includes(category)) ||
      (experience && !allowedExp.includes(experience))
    ) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: "Invalid category or experience" });
    }

    if (primaryPhone) {
      if (!phone10.test(primaryPhone)) {
        rmTmpFiles(req.files);
        return res
          .status(400)
          .json({ message: "Primary phone must be 10 digits" });
      }
      if (await Business.exists({ primaryPhone, _id: { $ne: business._id } })) {
        rmTmpFiles(req.files);
        return res
          .status(409)
          .json({ message: "Business with this phone already exists" });
      }
    }

    if (secondaryPhone && !phone10.test(secondaryPhone)) {
      rmTmpFiles(req.files);
      return res
        .status(400)
        .json({ message: "Secondary phone must be 10 digits" });
    }

    if (
      (openingHour && !time24.test(openingHour)) ||
      (closingHour && !time24.test(closingHour))
    ) {
      rmTmpFiles(req.files);
      return res.status(400).json({ message: "Time must be in HH:mm format" });
    }

    if (whatsappUrl && phone10.test(whatsappUrl)) {
      req.body.whatsappUrl = `https://wa.me/91${whatsappUrl}`;
    }

    Object.assign(business, req.body);

    if (req.files?.logo) business.logoUrl = req.files.logo[0].filename;
    if (req.files?.banner) business.bannerUrl = req.files.banner[0].filename;
    if (req.files?.aadhar) business.aadharUrl = req.files.aadhar[0].filename;
    if (req.files?.gallery && req.files.gallery.length)
      business.galleryUrls = req.files.gallery.map((f) => f.filename);

    await business.save();
    res.status(200).json({ message: "Business updated", business });
  } catch (err) {
    console.error("Update error", err.message);
    rmTmpFiles(req.files);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ───────────────────────────────────────────────
const deleteBusiness = async (req, res) => {
  try {
    if (!req.user?.uid)
      return res.status(401).json({ message: "Unauthorized" });

    const business = await Business.findOne({ ownerId: req.user.uid });
    if (!business)
      return res.status(404).json({ message: "Business not found" });

    const uploadDir = path.join(__dirname, "../uploads");
    const allFiles = [
      business.logoUrl,
      business.bannerUrl,
      business.aadharUrl,
      ...(business.galleryUrls || []),
    ];

    allFiles.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      if (file && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Business.findOneAndDelete({ ownerId: req.user.uid });
    await User.findByIdAndUpdate(req.user.uid, {
      $set: { role: "user" },
      $unset: { businessId: 1 },
    });

    const updatedUser = await User.findById(req.user.uid);
    const { accessToken } = signTokens(updatedUser);

    res.json({ message: "Business deleted", token: accessToken });
  } catch (err) {
    console.error("Delete error", err.message);
    res
      .status(500)
      .json({ message: "Failed to delete business", error: err.message });
  }
};

// ───────────────────────────────────────────────
module.exports = {
  getBusinesses,
  getMyBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
};
