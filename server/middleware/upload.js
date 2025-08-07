// ───────────────────────────────
// middleware/upload.js
// ───────────────────────────────
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|avif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  allowed.test(ext) && allowed.test(mime)
    ? cb(null, true)
    : cb(new Error("Only image files are allowed"));
};

exports.cpUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
  { name: "gallery", maxCount: 12 },
]);
