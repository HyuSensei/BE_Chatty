import { UserModal } from "../modals/UserModal.js";
import { MessageModal } from "../modals/MessageModal.js";

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await UserModal.updateOne(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );
    return res.status(200).json({
      success: true,
      message: "Update user successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getOtherUsers = async (req, res) => {
  try {
    const id = req.user._id;
    const users = await UserModal.find({
      _id: {
        $ne: id,
      },
    }).select("-password");
    const result = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await MessageModal.findOne({
          $or: [
            { sender: id, receiver: user._id },
            { sender: user._id, receiver: id },
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

    result.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      message: error.message || "Internal Server Error",
    });
  }
};
