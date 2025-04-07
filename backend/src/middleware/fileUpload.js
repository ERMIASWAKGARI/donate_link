const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Improved storage configuration
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // Validate file type
    const validTypes = {
      'application/pdf': 'pdf',
      'image/jpeg': 'image',
      'image/png': 'image',
    };

    const fileType = validTypes[mimeType] || 'other';
    cb(null, `${fileType}-${uniqueSuffix}${fileExt}`);
  },
});

// Enhanced file filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, JPEG, and PNG files are allowed!', 400), false);
  }
};

// Document field configuration
const DOCUMENT_FIELDS = {
  ngo: [
    { name: 'registrationCertificate', maxCount: 1 },
    { name: 'authorizationLetter', maxCount: 1 },
  ],
  organization_donor: [
    { name: 'licenseCertificate', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
  ],
  volunteer: [
    { name: 'idCard', maxCount: 1 },
    { name: 'trainingCertificate', maxCount: 1 },
  ],
  common: [{ name: 'additionalDocs', maxCount: 5 }],
};

// Dynamic fields middleware
const uploadVerificationDocsMiddleware = (req, res, next) => {
  const role = req.user?.role;
  const fields = [...DOCUMENT_FIELDS.common];

  if (role && DOCUMENT_FIELDS[role]) {
    fields.push(...DOCUMENT_FIELDS[role]);
  }

  multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).fields(fields)(req, res, next);
};
module.exports = uploadVerificationDocsMiddleware;
