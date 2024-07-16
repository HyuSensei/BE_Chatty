import jwt from "jsonwebtoken";
import { UserModal } from "../modals/UserModal.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.json({
        success: false,
        message: "Not found token",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECREAT_KEY);
    if (!decoded) {
      return res.json({
        success: false,
        message: "Invalid Token !",
      });
    }
    const user = await UserModal.findById(decoded.id).select("-password");
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error,
    });
  }
};
