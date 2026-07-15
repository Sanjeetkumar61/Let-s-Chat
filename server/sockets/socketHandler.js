const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    socket.on("registerUser", (userId) => {
      onlineUsers.set(userId, socket.id);

      socket.join(userId);

      io.emit(
        "getOnlineUsers",
        Array.from(onlineUsers.keys())
      );
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);

      if (!receiverSocketId) return;

      io.to(receiverSocketId).emit("userTyping", {
        senderId,
      });
    });

    socket.on("messageDelivered", ({ senderId, messageId }) => {
      const senderSocketId = onlineUsers.get(senderId);

      if (!senderSocketId) return;

      io.to(senderSocketId).emit("messageDelivered", {
        messageId,
      });
    });

    socket.on("messageRead", ({ senderId, messageId }) => {
      const senderSocketId = onlineUsers.get(senderId);

      if (!senderSocketId) return;

      io.to(senderSocketId).emit("messageRead", {
        messageId,
      });
    });

    socket.on("joinGroup", (groupId) => {
      socket.join(groupId);
    });

    socket.on("sendMessageToGroup", ({ groupId, message }) => {
      socket.to(groupId).emit("receiveGroupMessage", { groupId, message });
    });

    socket.on("leaveGroup", (groupId) => {
      socket.leave(groupId);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit(
        "getOnlineUsers",
        Array.from(onlineUsers.keys())
      );
    });

  });
};

export { socketHandler, onlineUsers };