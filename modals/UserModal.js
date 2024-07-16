import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },
    name: {
      type: String,
      require: [true, "provide name"],
    },
    email: {
      type: String,
      require: [true, "provide email"],
    },
    password: {
      type: String,
      require: [true, "provide password"],
    },
    profileImage: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModal = mongoose.model("User", userSchema);
