const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const Certificate = require("../models/Certificate");
const MaterialDonation = require("../models/matterialDonation");
const Payment = require("../models/paymentModel");
const Application = require("../models/applicationModel");
const { generateCertificatePDF } = require("../utils/pdfGenerator");
const User = require("../models/User"); // Added for debugging

// Thresholds configuration
const thresholds = {
  donation: 5, // Reduced to 1 for testing
  volunteering: 3, // Reduced to 1 for testing
};

// Middleware: Check eligibility and issue certificates
exports.checkCertificates = async (userId, userRole) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(
      `\n=== Checking certificates for ${user.name} (${user.role}) ===`
    );

    // Count all qualifying donations
    const [monetaryDonations, materialDonations] = await Promise.all([
      Payment.countDocuments({ donorId: userId, status: "Completed" }),
      MaterialDonation.countDocuments({ donorId: userId }),
    ]);
    const totalDonations = monetaryDonations + materialDonations;

    // Count approved volunteer applications
    const volunteeringCount = await Application.countDocuments({
      applicant: userId,
      status: "Accepted",
    });

    // Debug logs
    console.log("📊 Participation Counts:");
    console.log(`- Completed Payments: ${monetaryDonations}`);
    console.log(`- Material Donations: ${materialDonations}`);
    console.log(`- Total Donations: ${totalDonations}`);
    console.log(`- Approved Volunteering: ${volunteeringCount}`);

    // Issue certificates if thresholds are met
    if (totalDonations >= thresholds.donation) {
      console.log(
        `🎖️ User qualifies for donation certificate (${totalDonations}/${thresholds.donation})`
      );
      await issueCertificate(userId, "donation", totalDonations);
    } else {
      console.log(
        `⏳ Needs ${
          thresholds.donation - totalDonations
        } more donations for certificate`
      );
    }

    if (volunteeringCount >= thresholds.volunteering) {
      console.log(
        `🎖️ User qualifies for volunteering certificate (${volunteeringCount}/${thresholds.volunteering})`
      );
      await issueCertificate(userId, "volunteering", volunteeringCount);
    } else {
      console.log(
        `⏳ Needs ${
          thresholds.volunteering - volunteeringCount
        } more volunteering acts for certificate`
      );
    }
  } catch (error) {
    console.error("🔥 Certificate check error:", error.message);
    throw new AppError("Failed to check certificates", 500);
  }
};

// Helper: Issue a new certificate
const issueCertificate = async (userId, type, count) => {
  try {
    const threshold = thresholds[type];
    const exists = await Certificate.findOne({ user: userId, type, threshold });

    if (!exists) {
      console.log(`🆕 Creating new ${type} certificate...`);
      const user = await User.findById(userId);
      const pdfBuffer = await generateCertificatePDF(userId, type, count);

      const certificate = new Certificate({
        user: userId,
        type,
        participationCount: count,
        threshold,
        pdfData: pdfBuffer,
        metadata: {
          designVersion: "v2",
          issuer: "NGO Excellence Foundation",
        },
      });

      await certificate.save();

      // Optional: Trigger email notification here
      console.log(`✅ Created ${type} certificate for ${user.name}`);
      return certificate;
    }
    return exists;
  } catch (error) {
    console.error("Failed to issue certificate:", error);
    throw error;
  }
};

// Updated get certificates with better population
exports.getUserCertificates = asyncWrapper(async (req, res, next) => {
  const [
    certificates,
    monetaryDonations,
    materialDonations,
    volunteeringCount,
  ] = await Promise.all([
    Certificate.find({ user: req.user._id }).sort("-issuedAt").lean(),
    Payment.countDocuments({ donorId: req.user._id, status: "Completed" }),
    MaterialDonation.countDocuments({ donorId: req.user._id }),
    Application.countDocuments({ applicant: req.user._id, status: "Accepted" }),
  ]);

  const totalDonations = monetaryDonations + materialDonations;

  sendSuccessResponse(res, 200, {
    certificates,
    thresholds,
    progress: {
      donations: {
        current: totalDonations,
        remaining: Math.max(0, thresholds.donation - totalDonations),
      },
      volunteering: {
        current: volunteeringCount,
        remaining: Math.max(0, thresholds.volunteering - volunteeringCount),
      },
    },
  });
});
// API: Download certificate as PDF
exports.downloadCertificate = asyncWrapper(async (req, res, next) => {
  const cert = await Certificate.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cert) {
    console.log(
      `❌ Certificate ${req.params.id} not found for user ${req.user._id}`
    );
    return next(new AppError("Certificate not found", 404));
  }

  console.log(`📥 Serving certificate ${req.params.id} for download`);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificate-${cert._id}.pdf`
  );
  res.send(cert.pdfData);
});
