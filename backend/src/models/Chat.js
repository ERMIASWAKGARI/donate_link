const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        url: String,
        type: { type: String, enum: ["image", "file"] },
      },
    ],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    validate: [
      {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: "Conversation must have exactly 2 participants",
      },
      {
        validator: function (arr) {
          return arr[0].toString() !== arr[1].toString();
        },
        message: "Cannot create conversation with yourself",
      },
    ],
  },

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message", // Reference the Message model
  }, // ... other fields
});

// Update conversation timestamp when a message is sent
messageSchema.post("save", async function (doc) {
  await Conversation.findByIdAndUpdate(doc.conversationId, {
    lastMessage: doc._id,
    updatedAt: Date.now(),
  });
});

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Message, Conversation };
