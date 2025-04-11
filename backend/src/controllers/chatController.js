const { getIO } = require("../utils/socketConfig");
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
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "name profilePicture role")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "_id name profilePicture", // Include needed sender fields
        },
      });
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

  // Validation
  if (!conversationId)
    return next(new AppError("Conversation ID is required", 400));
  if (!content?.trim() && attachments.length === 0) {
    return next(new AppError("Message content or attachment is required", 400));
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).populate("participants");

  if (!conversation) {
    return next(new AppError("Conversation not found or unauthorized", 404));
  }

  // Create and save message
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

  // Populate message for real-time emission
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name profilePicture")
    .populate({
      path: "conversationId",
      select: "participants",
      populate: { path: "participants", select: "_id" },
    });

  // Real-time emission
  const io = getIO();

  // 1. Emit to conversation room
  io.to(conversationId).emit("newMessage", populatedMessage);

  // 2. Notify participants about unread count
  populatedMessage.conversationId.participants.forEach((participant) => {
    if (participant._id.toString() !== userId.toString()) {
      io.to(participant._id.toString()).emit("unreadUpdate", {
        conversationId,
        increment: 1,
      });
    }
  });

  sendSuccessResponse(res, 201, {
    status: "success",
    message: populatedMessage, // Directly send the message here
    data: {
      success: true,
      message: populatedMessage, // Optional, if you need it in data too
    },
  });
});

// Enhanced markAsRead controller
exports.markAsRead = asyncWrapper(async (req, res, next) => {
  const { messageIds } = req.body;
  const userId = req.user._id;

  if (!messageIds?.length) {
    return next(new AppError("No message IDs provided", 400));
  }

  // 1. Filter out messages sent by the current user
  const incomingMessages = await Message.find({
    _id: { $in: messageIds },
    sender: { $ne: userId }, // Exclude messages sent by the user
  });

  const incomingMessageIds = incomingMessages.map((msg) => msg._id);

  if (!incomingMessageIds.length) {
    return next(new AppError("No incoming messages to mark as read", 400));
  }

  // 2. Mark only incoming messages as read
  const result = await Message.updateMany(
    {
      _id: { $in: incomingMessageIds },
      readBy: { $ne: userId },
      sender: { $ne: userId },
    },
    {
      $push: { readBy: userId },
    }
  );

  // 3. Real-time updates
  const io = getIO();

  // Emit to the current user's socket
  io.to(userId.toString()).emit("messagesRead", {
    messageIds: incomingMessageIds,
  });

  // Emit to other conversation participants
  const messages = await Message.find({ _id: { $in: incomingMessageIds } })
    .select("conversationId")
    .populate({
      path: "conversationId",
      select: "participants",
      populate: { path: "participants", select: "_id" },
    });

  const uniqueConversations = [
    ...new Set(messages.map((m) => m.conversationId._id.toString())),
  ];

  uniqueConversations.forEach((convId) => {
    const conversation = messages.find(
      (m) => m.conversationId._id.toString() === convId
    )?.conversationId;

    if (conversation) {
      conversation.participants.forEach((participant) => {
        if (participant._id.toString() !== userId.toString()) {
          io.to(participant._id.toString()).emit("unreadUpdate", {
            conversationId: convId,
            increment: -incomingMessageIds.length,
          });
        }
      });
    }
  });

  sendSuccessResponse(res, 200, {
    success: true,
    modifiedCount: result.modifiedCount,
  });
});

exports.deleteAllMessages = asyncWrapper(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    return next(
      new AppError(
        "Not authorized to delete messages in this conversation",
        403
      )
    );
  }

  // Delete all messages in the conversation
  const result = await Message.deleteMany({ conversationId });

  sendSuccessResponse(res, 200, {
    success: true,
    deletedCount: result.deletedCount,
    message: "All messages deleted successfully",
  });
});
