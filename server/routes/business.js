// server/routes/business.js
const express = require("express");
const router = express.Router();

const {
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getMyBusiness,
} = require("../controllers/businessController");

const { authenticateToken } = require("../middleware/auth");
const { cpUpload } = require("../middleware/upload");

// ─────────────────────────────────────────────
// Public Route
// ─────────────────────────────────────────────
router.get("/", getBusinesses);

// ─────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────
router.get("/me", authenticateToken, getMyBusiness);
router.post("/", authenticateToken, cpUpload, createBusiness);
router.put("/:id", authenticateToken, cpUpload, updateBusiness);
router.delete("/:id", authenticateToken, deleteBusiness);

module.exports = router;
