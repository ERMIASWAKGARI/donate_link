const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure permanent storage directory
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads/donations");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  cb(null, mimetype && extname);
};

// In your multer configuration file
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Max 5 files
  },
}).array("files"); // Changed from "images" to "files" to match frontend

// Simplified move function (no longer needed since we upload directly)
const getFileUrls = (files) => {
  return files.map((file) => `/uploads/donations/${file.filename}`);
};

module.exports = {
  upload,
  getFileUrls, // Export if needed elsewhere
};
