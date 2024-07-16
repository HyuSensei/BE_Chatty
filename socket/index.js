import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { getUsers } from "../services/getOtherUsers.js";
import { updateSeenMessage } from "../services/updateMessage.js";
dotenv.config({});

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiver) => {
  return userSocketMap[receiver];
};

io.on("connection", (socket) => {
  console.log("<------ Connect User <-------", socket.id);

  const userId = socket.handshake.query.userId;
  userSocketMap[userId] = socket.id;

  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("other-users", async (currentUserId) => {
    const users = await getUsers(currentUserId);
    socket.emit("conversation", users);
  });

  socket.on("seen", async (messageId) => {
    await updateSeenMessage(messageId);
  });

  socket.on("disconnect", () => {
    console.log("-------> Disconnect User ------->", socket.id);
    delete userSocketMap[userId];
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

export { io, app, server };
