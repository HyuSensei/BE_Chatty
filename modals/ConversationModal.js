import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ConversationModal = mongoose.model(
  "Conversation",
  conversationSchema
);
