import { MessageModal } from "../modals/MessageModal.js";

export const updateSeenMessage = async (messageId) => {
  try {
    await MessageModal.updateOne(
      {
        _id: messageId,
      },
      {
        $set: {
          seen: true,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};
