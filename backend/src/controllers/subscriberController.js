const Subscriber = require("../models/Subscriber");
const { sendEmail } = require("../utils/emailService");
// Add a new subscriber
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists and is active
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === "active") {
        return res.status(400).json({
          success: false,
          message: "This email is already subscribed",
        });
      } else {
        // Reactivate inactive subscriber
        existingSubscriber.status = "active";
        await existingSubscriber.save();

        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        await sendEmail(
          email,
          "Welcome back to our newsletter!",
          `
            <p>We're glad to have you back as a subscriber!</p>
            <p>You'll receive our latest updates and news.</p>
            <p>
              <a href="${baseUrl}/unsubscribe/${encodeURIComponent(
            email
          )}" style="color: red;">
                Unsubscribe
              </a>
            </p>
          `
        );

        return res.status(200).json({
          success: true,
          message: "Resubscription successful! Welcome back!",
        });
      }
    }

    // Create new subscriber with active status
    const subscriber = new Subscriber({
      email,
      status: "active",
    });

    await subscriber.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Send welcome email
    await sendEmail(
      email,
      "Thanks for subscribing!",
      `
        <p>Thank you for subscribing to our newsletter!</p>
        <p>You'll receive our latest updates and news.</p>
        <p>
          <a href="${baseUrl}/unsubscribe/${encodeURIComponent(
        email
      )}" style="color: red;">
            Unsubscribe
          </a>
        </p>
      `
    );

    res.status(201).json({
      success: true,
      message: "Subscription successful!",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process subscription",
      error: error.message,
    });
  }
};

// Unsubscribe a user
exports.unsubscribeSubscriber = async (req, res) => {
  const { email } = req.params;

  try {
    const decodedEmail = decodeURIComponent(email);
    const subscriber = await Subscriber.findOne({ email: decodedEmail });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    subscriber.status = "inactive";
    await subscriber.save();

    res.json({
      success: true,
      message: "You have been unsubscribed successfully.",
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
      error: err.message,
    });
  }
};
// Fetch all subscribers (Admin use)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err });
  }
};

// Delete a subscriber (Admin use)
exports.deleteSubscriber = async (req, res) => {
  const { id } = req.params;

  try {
    await Subscriber.findByIdAndDelete(id);
    res.json({ message: "Subscriber deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err });
  }
};
