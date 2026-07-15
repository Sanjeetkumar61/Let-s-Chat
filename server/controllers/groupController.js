import Group from "../models/group.js";
import Message from "../models/message.js";
import { getIO } from "../sockets/socket.js";
import { onlineUsers } from "../sockets/socketHandler.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const admin = req.user._id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    let groupMembers = members || [];


    if (!groupMembers.includes(admin.toString())) {
      groupMembers.push(admin);
    }

    const group = await Group.create({
      name,
      description,
      admin,
      members: groupMembers,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "name email")
      .populate("members", "name email profilePic");

    const io = getIO();


    groupMembers.forEach((memberId) => {
      const socketId = onlineUsers.get(memberId.toString());

      if (socketId) {
        io.to(socketId).emit("groupCreated", populatedGroup);
      }
    });
    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      members: userId,
    })
      .populate("admin", "name email")
      .populate("members", "name email profilePic");

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("admin", "name email")
      .populate("members", "name email profilePic");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const sendGroupMessage = async (req, res) => {
  try {
    const senderId = req.user._id;

    const { groupId } = req.params;

    const { message = "" } = req.body;

    const newMessage = await Message.create({
      senderId,
      groupId,
      message,
    });

    const group = await Group.findById(groupId);

    if (group) {
      group.lastMessage = message || "📎 Attachment";
      group.lastMessageTime = new Date();

      await group.save();

    }

    const populatedMessage =
      await Message.findById(newMessage._id)
        .populate("senderId", "name");

    const io = getIO();

    io.to(groupId).emit(
      "receiveGroupMessage",
      populatedMessage
    );

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: populatedMessage,
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
    const { groupId } = req.params;

    const messages = await Message.find({
      groupId,
    })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });

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