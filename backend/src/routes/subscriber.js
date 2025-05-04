const express = require("express");
const router = express.Router();
const SubscriberController = require("../controllers/subscriberController");

// Routes for subscriber actions
router.post("/", SubscriberController.addSubscriber); // Add subscriber
router.put("/unsubscribe/:email", SubscriberController.unsubscribeSubscriber); // Unsubscribe user

// Routes for admin actions
router.get("/admin/subscribers", SubscriberController.getSubscribers); // Fetch all subscribers
router.delete("/admin/subscribers/:id", SubscriberController.deleteSubscriber); // Delete a subscriber

module.exports = router;
