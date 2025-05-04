const Newsletter = require("../models/Newsletter");
const Subscriber = require("../models/Subscriber");
const { sendEmail } = require("../utils/emailService");
const APIFeatures = require("../utils/apiFeatures");

// Admin: Create a new newsletter draft
exports.createNewsletter = async (req, res) => {
  try {
    const { subject, content, scheduledAt } = req.body;

    const newsletter = await Newsletter.create({
      subject,
      content,
      scheduledAt: scheduledAt || null,
      createdBy: req.user._id, // Admin user from auth middleware
    });

    res.status(201).json({
      success: true,
      data: newsletter,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Send newsletter immediately
exports.sendNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    // Get active subscribers
    const subscribers = await Subscriber.find({ status: "active" });
    if (subscribers.length === 0) {
      return res.status(400).json({ error: "No active subscribers" });
    }

    // Prepare base URL with fallback
    const baseUrl = process.env.BASE_URL || "http://localhost:5173";

    // Create HTML template
    const htmlTemplate = (email) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
        <div style="background-color: #008080
; padding: 15px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          ${newsletter.subject}
        </div>
        <div style="padding: 20px;">
          ${newsletter.content.replace(/\n/g, "<br>")}
        </div>
        <div style="text-align: center; padding: 20px;">
          <a href="${baseUrl}/unsubscribe/${encodeURIComponent(
      email
    )}" style="color: #008080; text-decoration: underline;">
        Unsubscribe
      </a>
     
        </div>
        <div style="background-color: #eee; text-align: center; padding: 10px; font-size: 12px; color: #666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          &copy; ${new Date().getFullYear()} Online Donation Platform. All rights reserved.
        </div>
      </div>
    `;

    // Send emails with proper formatting
    const emailPromises = subscribers.map((subscriber) => {
      const personalizedHtml = htmlTemplate(subscriber.email);

      return sendEmail(
        subscriber.email, // to email
        newsletter.subject, // subject
        personalizedHtml // html content
      );
    });

    await Promise.all(emailPromises);

    // Update newsletter record
    newsletter.status = "sent";
    newsletter.sentAt = new Date();
    newsletter.recipients = subscribers.map((s) => s._id);
    await newsletter.save();

    res.json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.createAndSendNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;

    // 1. Create the newsletter
    const newsletter = await Newsletter.create({
      subject,
      content,
      createdBy: req.user._id,
    });

    // 2. Get active subscribers
    const subscribers = await Subscriber.find({ status: "active" });
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No active subscribers available",
      });
    }

    // 3. Prepare base URL
    const baseUrl = process.env.BASE_URL || "http://localhost:5173";

    // 4. Send emails with proper formatting
    const emailPromises = subscribers.map((subscriber) => {
      // Create HTML content for each subscriber with their specific email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
          <div style="background-color: #008080; padding: 15px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            ${subject}
          </div>
          <div style="padding: 20px;">
            ${content.replace(/\n/g, "<br>")}
          </div>
          <div style="text-align: center; padding: 20px;">
           <a href="${baseUrl}/unsubscribe/${encodeURIComponent(
        subscriber.email
      )}" style="color: #008080; text-decoration: underline;">
        Unsubscribe
      </a>
          </div>
          <div style="background-color: #eee; text-align: center; padding: 10px; font-size: 12px; color: #666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            &copy; ${new Date().getFullYear()} Online Donation Platform. All rights reserved.
          </div>
        </div>
      `;

      return sendEmail(subscriber.email, subject, htmlContent);
    });

    // 5. Execute all email sends in parallel
    await Promise.all(emailPromises);

    // 6. Update newsletter record
    newsletter.status = "sent";
    newsletter.sentAt = new Date();
    newsletter.recipients = subscribers.map((s) => s._id);
    await newsletter.save();

    res.status(201).json({
      success: true,
      message: `Newsletter created and sent to ${subscribers.length} subscribers`,
      data: newsletter,
    });
  } catch (error) {
    console.error("Error in createAndSendNewsletter:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Admin: Schedule a newsletter
// Admin: Delete a newsletter
exports.deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res
        .status(404)
        .json({ success: false, error: "Newsletter not found" });
    }

    await newsletter.deleteOne(); // Deletes the newsletter

    res.status(200).json({
      success: true,
      message: "Newsletter deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Get all newsletters (for dashboard)
exports.getNewsletters = async (req, res) => {
  try {
    let query = Newsletter.find().populate("createdBy", "name email");

    // Apply filtering, sorting, pagination
    const features = new APIFeatures(query, req.query)
      .filter() // Changed from .multfilter()
      .search() // You might want to add this if you need search functionality
      .sort()
      .limit() // Changed from .limiting()
      .paginate(); // Changed from .paginatinating()

    const totalRecords = await Newsletter.countDocuments(
      features.query.getQuery() // Removed await here as it's not needed
    );

    const newsletters = await features.query;

    if (newsletters.length === 0) {
      return res.status(404).json({ message: "No newsletters found" });
    }

    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      success: true,
      totalPages,
      totalRecords,
      data: newsletters,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNewsletterById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update newsletter
exports.updateNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;
    const newsletter = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { subject, content },
      { new: true }
    );
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found" });
    }
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
