import { ConversationModal } from "../modals/ConversationModal.js";
import { MessageModal } from "../modals/MessageModal.js";
import { getReceiverSocketId, io } from "../socket/index.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, imageUrl, videoUrl } = req.body;
    const receiver = req.params.id;
    const sender = req.user._id;

    let conversation = await ConversationModal.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (!conversation) {
      conversation = await ConversationModal.create({
        sender,
        receiver,
      });
    }

    const newMessage = new MessageModal({
      sender,
      receiver,
      message,
      imageUrl,
      videoUrl,
      seen: false,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiver);
    io.to(receiverSocketId).emit("send-message", newMessage);

    return res.status(200).json({
      success: true,
      message: "Send message successfully",
      data: newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const receiver = req.params.id;
    const conversation = await ConversationModal.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate("messages");
    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const seenMessage = async (req, res) => {
  try {
    const receiver = req.user._id;
    const sender = req.params.receiver;
    await MessageModal.updateMany(
      { sender, receiver, seen: false },
      { seen: true }
    );
    return res.status(200).json({
      success: true,
      message: "Seen message",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
