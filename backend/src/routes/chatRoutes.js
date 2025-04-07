const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/conversations", chatController.getUserConversations);
router.get("/conversation/:participantId", chatController.getConversation);
router.get("/messages/:conversationId", chatController.getMessages);
router.post("/messages", chatController.sendMessage);
router.post("/messages/read", chatController.markAsRead);

module.exports = router;
