import axios from "axios";
import Message from "../models/message.js";
import { onlineUsers } from "../sockets/socketHandler.js";
import { getIO } from "../sockets/socket.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "chat-app",
        resource_type: isImage ? "image" : "raw",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { receiverId } = req.params;
    const { message = "" } = req.body;

    let fileUrl = "";
    let downloadUrl = "";
    let fileName = "";
    let fileType = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      fileUrl = result.secure_url;
      downloadUrl = result.secure_url.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
    }

    if (!message.trim() && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Message or file is required",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      fileUrl,
      downloadUrl,
      fileName,
      fileType,
    });

    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();

      const io = getIO();
      io.to(receiverSocketId).emit("receiveMessage", newMessage);

      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      deletedFor: {
        $ne: senderId,
      },
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const messages = await Message.find({
      groupId: groupId,
      deletedFor: {
        $ne: userId,
      },
    })
      .populate("senderId", "name email")
      .sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const markAsDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "delivered" },
      { returnDocument: "after" }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const senderSocketId = onlineUsers.get(message.senderId?.toString());
    if (senderSocketId) {
      const io = getIO();
      io.to(senderSocketId).emit("messageDelivered", {
        messageId: message._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as delivered",
      data: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { returnDocument: "after" }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const senderSocketId = onlineUsers.get(message.senderId?.toString());
    if (senderSocketId) {
      const io = getIO();
      io.to(senderSocketId).emit("messageRead", {
        messageId: message._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message || !message.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const response = await axios({
      url: message.fileUrl,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${message.fileName}"`
    );
    res.setHeader("Content-Type", message.fileType);

    response.data.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};

export const openFile = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message || !message.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const response = await axios({
      url: message.fileUrl,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Type", message.fileType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${message.fileName}"`
    );

    response.data.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to open file",
    });
  }
};

export const deleteForMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      message.deletedFor.some(
        (id) => id.toString() === userId.toString()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Message already deleted",
      });
    }

    message.deletedFor.push(userId);
    await message.save();

    res.status(200).json({
      success: true,
      message: "Deleted for you",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteForEveryone = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.senderId?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    message.deletedForEveryone = true;
    message.message = "This message was deleted";
    message.fileUrl = "";
    message.fileName = "";
    message.fileType = "";

    await message.save();

    const io = getIO();


    const senderSocketId = onlineUsers.get(message.senderId?.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeletedEveryone", {
        messageId,
        receiverId: message.receiverId,
        groupId: message.groupId
      });
    }


    if (message.receiverId) {
      const receiverSocketId = onlineUsers.get(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeletedEveryone", {
          messageId,
          receiverId: message.receiverId
        });
      }
    }


    if (message.groupId) {
      io.to(message.groupId.toString()).emit("messageDeletedEveryone", {
        messageId,
        groupId: message.groupId,
        updatedMessage: message
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted for everyone",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};