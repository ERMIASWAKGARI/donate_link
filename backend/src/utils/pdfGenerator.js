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

      // Background gradient
      const gradient = doc.linearGradient(
        0,
        0,
        doc.page.width,
        doc.page.height
      );
      gradient.stop(0, "#e0f2f1").stop(1, "#ffffff");
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(gradient);

      // Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(2)
        .stroke("#0f766e");

      // Top bar
      doc.rect(0, 0, doc.page.width, 4).fill("#0f766e");

      // Logo
      const logoPath = path.join(__dirname, "../assets/logosa.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 90, height: 70 });
      }

      // Decorative icon (bottom right)
      doc
        .save()
        .opacity(0.1)
        .translate(doc.page.width - 140, doc.page.height - 140);
      if (type === "volunteering") {
        doc
          .fill("#0f766e")
          .moveTo(0, 0)
          .lineTo(40, -40)
          .lineTo(80, 0)
          .lineTo(40, 40)
          .lineTo(0, 0)
          .fill();
      } else {
        doc.fill("#0f766e").circle(40, 0, 40).fill();
      }
      doc.restore();

      const padding = 40;
      const width = doc.page.width - padding * 2;

      // Title
      doc
        .fill("#0f766e")
        .fontSize(40)
        .font("Helvetica-Bold")
        .text(
          type === "volunteering"
            ? "Certificate of Appreciation"
            : "Certificate of Generosity",
          padding,
          120,
          { align: "center", width }
        );

      // Underline (at y: 170)
      doc
        .moveTo(doc.page.width / 2 - 60, 160)
        .lineTo(doc.page.width / 2 + 60, 160)
        .lineWidth(1.5)
        .stroke("#14b8a6");

      // Subtitle
      doc
        .fill("#374151")
        .fontSize(16)
        .text("This certificate is proudly presented to", {
          align: "center",
          width,
          y: 230,
        });

      // Name
      function toTitleCase(str) {
        return str
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      doc
        .fill("#1f2937")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(toTitleCase(user.name), {
          align: "center",
          width,
          y: 280,
        });

      // Contribution text
      doc
        .fill("#475569")
        .fontSize(14)
        .text("For outstanding contributions to our community", {
          align: "center",
          width,
          y: 330,
        });

      // Description
      const desc =
        type === "donation"
          ? `In recognition of ${count} generous donations completed`
          : `In recognition of ${count} volunteer activities completed`;

      doc.fill("#334155").fontSize(16).text(desc, {
        align: "center",
        width,
        y: 365,
      });

      // Extra text for volunteering
      if (type === "volunteering") {
        doc
          .fill("#475569")
          .fontSize(14)
          .text("With gratitude for your service and dedication.", {
            align: "center",
            width,
            y: 400,
          });
      }

      // Footer section
      const footerY = 460;
      doc
        .fill("#4b5563")
        .fontSize(13)
        .text("DonateLink Excellence Foundation", 60, footerY);
      doc
        .fill("#6b7280")
        .fontSize(10)
        .text(`Certificate ID: ${Date.now().toString(36)}`, 60, footerY + 20);

      // --- Heart icon underlay behind "Issued on" ---
      const heartX = doc.page.width - 130;
      const heartY = footerY + 12;
      doc.save().translate(heartX, heartY).opacity(0.08).fill("#0f766e");

      doc
        .moveTo(0, 0)
        .bezierCurveTo(0, -15, -25, -15, -25, 10)
        .bezierCurveTo(-25, 25, 0, 35, 0, 45)
        .bezierCurveTo(0, 35, 25, 25, 25, 10)
        .bezierCurveTo(25, -15, 0, -15, 0, 0)
        .fill();

      doc.restore();

      // Issued on text
      const rightOffset = 100;
      const textWidth = 200;
      doc
        .fill("#64748b")
        .fontSize(12)
        .text(
          `Issued on ${new Date().toLocaleDateString()}`,
          doc.page.width - rightOffset - textWidth,
          footerY + 20,
          {
            align: "right",
            width: textWidth,
          }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateCertificatePDF };
