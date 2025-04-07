const { Conversation, Message } = require("../models/Chat");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const User = require("../models/User");

// Start or get existing conversation
exports.getConversation = asyncWrapper(async (req, res, next) => {
  const { participantId } = req.params;
  const userId = req.user._id;

  // Validate participants
  const participant = await User.findById(participantId);
  if (!participant) {
    return next(new AppError("Participant not found", 404));
  }

  // Check for existing conversation first
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] },
  }).populate("participants", "name profilePicture role");

  if (!conversation) {
    // Create new conversation if none exists
    conversation = await Conversation.create({
      participants: [userId, participantId],
    });
    conversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name profilePicture role"
    );
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});
// Get all conversations for a user
exports.getUserConversations = asyncWrapper(async (req, res, next) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name profilePicture role")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  sendSuccessResponse(res, 200, {
    count: conversations.length,
    conversations,
  });
});

// Get messages in a conversation
exports.getMessages = asyncWrapper(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Verify conversation exists and user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    return next(new AppError("Not authorized to view this conversation", 403));
  }

  // Get messages with proper population
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", "name profilePicture")
    .lean(); // Convert to plain JS object

  // Ensure consistent response format
  sendSuccessResponse(res, 200, {
    success: true,
    count: messages.length,
    messages,
  });
});

// Send a message
exports.sendMessage = asyncWrapper(async (req, res, next) => {
  const { conversationId, content, attachments = [] } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!conversationId) {
    return next(new AppError("Conversation ID is required", 400));
  }

  if (!content?.trim() && attachments.length === 0) {
    return next(new AppError("Message content or attachment is required", 400));
  }

  try {
    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return next(new AppError("Conversation not found or unauthorized", 404));
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: userId,
      content: content?.trim(),
      attachments,
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    // Populate message with necessary data
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name profilePicture")
      .populate({
        path: "conversationId",
        select: "participants",
        populate: {
          path: "participants",
          select: "name profilePicture role",
        },
      });

    // Send success response
    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("Message creation error:", err);
    return next(new AppError("Failed to send message", 500));
  }
});
// Mark messages as read
exports.markAsRead = asyncWrapper(async (req, res, next) => {
  const { messageIds } = req.body;
  const userId = req.user._id;

  if (!messageIds?.length) {
    return next(new AppError("No message IDs provided", 400));
  }

  const result = await Message.updateMany(
    { _id: { $in: messageIds }, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );

  sendSuccessResponse(res, 200, {
    success: true,
    modifiedCount: result.modifiedCount,
  });
});
