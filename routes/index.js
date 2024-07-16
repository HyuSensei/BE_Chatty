import express from "express";
import {
  getUser,
  login,
  logout,
  register,
} from "../controller/AuthController.js";
import { getOtherUsers, updateUser } from "../controller/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMessage,
  seenMessage,
  sendMessage,
} from "../controller/MessageController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

router.get("/user", authMiddleware, getUser);
router.get("/users", authMiddleware, getOtherUsers);
router.put("/user/:id", updateUser);

router.get("/message/:id", authMiddleware, getMessage);
router.post("/message/:id", authMiddleware, sendMessage);
router.put("/message/seen/:receiver", authMiddleware, seenMessage);

export default router;
