import { MessageModal } from "../modals/MessageModal.js";
import { UserModal } from "../modals/UserModal.js";

export const getUsers = async (currentUserId) => {
  try {
    const users = await UserModal.find({
      _id: {
        $ne: currentUserId,
      },
    })
      .sort({ updatedAt: -1 })
      .select("-password");
    const result = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await MessageModal.findOne({
          $or: [
            { sender: currentUserId, receiver: user._id },
            { sender: user._id, receiver: currentUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          ...user.toObject(),
          lastMessage: lastMessage || null,
        };
      })
    );

    return result.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.log(error);
  }
};
