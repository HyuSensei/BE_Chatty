import { UserModal } from "../modals/UserModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Fields are require",
      });
    }
    const user = await UserModal.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not exit",
      });
    }
    const isCheckPassword = await bcrypt.compare(password, user._doc.password);
    if (!isCheckPassword) {
      return res.status(400).json({
        success: false,
        message: "Please check password",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECREAT_KEY,
      {
        expiresIn: "3d",
      }
    );
    return res.status(200).json({
      success: true,
      token: token,
      message: "Login successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "Fields are require",
      });
    }
    const isEmail = await UserModal.findOne({ email });
    if (isEmail) {
      return res.status(400).json({
        success: false,
        message: "Already user exits",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const maleProfile = `https://avatar.iran.liara.run/public/boy?name=${name}`;
    const femaleProfile = `https://avatar.iran.liara.run/public/girl?name=${name}`;
    await UserModal.create({
      name,
      email,
      password: hashPassword,
      profileImage: gender === "male" ? maleProfile : femaleProfile,
      gender,
    });
    return res.status(201).json({
      success: true,
      message: "User register successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await UserModal.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Not found user",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
