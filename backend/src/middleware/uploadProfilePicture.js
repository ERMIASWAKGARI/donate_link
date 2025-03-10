const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");

// Storage configuration for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profilePictures/"); // Store in a separate folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter: Only allow JPEG and PNG for profile pictures
const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png"];

  if (allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only JPEG and PNG images are allowed for profile pictures!",
        400
      ),
      false
    );
  }
};

// Configure Multer
const uploadProfilePictureMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
}).single("profilePicture");

module.exports = uploadProfilePictureMiddleware;
