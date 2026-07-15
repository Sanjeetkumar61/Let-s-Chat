import User from "../models/user.js";
import Message from "../models/message.js";

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    }).select("-password");

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            {
              senderId: req.user._id,
              receiverId: user._id,
            },
            {
              senderId: user._id,
              receiverId: req.user._id,
            },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),

          lastMessage: lastMessage
            ? lastMessage.message
            : "",

          lastMessageTime: lastMessage
            ? lastMessage.createdAt
            : null,
        };
      })
    );

    usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;

      return (
        new Date(b.lastMessageTime) -
        new Date(a.lastMessageTime)
      );
    });

    res.status(200).json({
      success: true,
      users: usersWithLastMessage,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};