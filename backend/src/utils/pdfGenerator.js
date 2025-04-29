const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const AppError = require("../utils/appError");

async function generateCertificatePDF(userId, type, count) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) throw new AppError("User not found", 404);

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Try to load background image or use fallback
      const bgPath = path.join(__dirname, "../assets/certificate-bg.jpg");
      if (fs.existsSync(bgPath)) {
        doc.image(bgPath, 0, 0, { width: 842, height: 595 });
      } else {
        doc.rect(0, 0, 842, 595).fill("#f8f9fa");
      }

      // Certificate Content
      doc
        .fill("#1a365d")
        .fontSize(36)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF APPRECIATION", {
          align: "center",
          underline: true,
          y: 100,
        });

      doc
        .fill("#2d3748")
        .fontSize(20)
        .text("This certificate is proudly presented to", {
          align: "center",
          y: 180,
        });

      doc
        .fill("#1e40af")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text(user.name.toUpperCase(), {
          align: "center",
          y: 220,
        });

      doc
        .fill("#4a5568")
        .fontSize(16)
        .text(
          `For ${
            type === "donation"
              ? "generous donations"
              : "dedicated volunteering service"
          }`,
          {
            align: "center",
            y: 280,
          }
        );

      doc.text(
        `Total ${
          type === "donation" ? "donations" : "volunteering acts"
        }: ${count}`,
        {
          align: "center",
          y: 320,
        }
      );

      // Footer
      doc
        .fill("#718096")
        .fontSize(12)
        .text(`Issued on ${new Date().toLocaleDateString()}`, {
          align: "center",
          y: 500,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateCertificatePDF };
