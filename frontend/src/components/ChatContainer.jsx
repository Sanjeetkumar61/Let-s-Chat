import { useEffect, useRef, useState } from "react";

import socket from "../services/socket";
import {
  getMessages,
  sendMessage,
  markAsDelivered,
  markAsRead,
  deleteForMe,
  deleteForEveryone,
} from "../services/messageService";
import { sendGroupMessage, getGroupMessages } from "../services/groupService";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatContainer = ({
  user,
  selectedUser,
  onlineUsers,
  setSelectedUser,
  updateLastMessage,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = async (message) => {
      if (!message) return;
      if (
        selectedUser &&
        (String(message.senderId) === String(selectedUser._id) ||
          String(message.receiverId) === String(selectedUser._id))
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }

      const textContent =
        message.message ||
        message.text ||
        (message.file ? "📎 Attachment" : "");

      updateLastMessage(
        message.senderId,
        textContent,
        message.createdAt || new Date().toISOString(),
      );

      if (String(message.receiverId) === String(user.id)) {
        try {
          if (message.status === "sent") {
            await markAsDelivered(message._id);
          }

          if (
            selectedUser &&
            String(selectedUser._id) === String(message.senderId)
          ) {
            await markAsRead(message._id);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser, updateLastMessage, user]);

  useEffect(() => {
    const handleUserTyping = ({ senderId }) => {
      if (String(selectedUser?._id) !== String(senderId)) return;

      setIsTyping(true);

      clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    };

    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                status: "delivered",
              }
            : msg,
        ),
      );
    };

    socket.on("messageDelivered", handleMessageDelivered);

    return () => {
      socket.off("messageDelivered", handleMessageDelivered);
    };
  }, []);

  useEffect(() => {
    const handleMessageRead = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                status: "read",
              }
            : msg,
        ),
      );
    };

    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("messageRead", handleMessageRead);
    };
  }, []);

  useEffect(() => {
    const handleDeleteEveryone = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deletedForEveryone: true,
                message: "This message was deleted",
                fileUrl: "",
                fileName: "",
                fileType: "",
              }
            : msg,
        ),
      );
    };

    socket.on("messageDeletedEveryone", handleDeleteEveryone);

    return () => {
      socket.off("messageDeletedEveryone", handleDeleteEveryone);
    };
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUser.type === "group") {
      socket.emit("joinGroup", selectedUser._id);
    }

    return () => {
      if (selectedUser && selectedUser.type === "group") {
        socket.emit("leaveGroup", selectedUser._id);
      }
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleReceiveGroupMessage = (data) => {
      if (!data) return;

      const groupId =
        data.groupId || data.message?.groupId || selectedUser?._id;
      const actualMessage =
        data.message && typeof data.message === "object" ? data.message : data;

      if (
        selectedUser &&
        selectedUser.type === "group" &&
        String(groupId) === String(selectedUser._id)
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === actualMessage._id);
          if (exists) return prev;
          return [...prev, actualMessage];
        });
      }

      const textContent =
        actualMessage.message ||
        actualMessage.text ||
        (actualMessage.file ? "📎 Attachment" : "");

      const timestamp =
        actualMessage.createdAt ||
        actualMessage.timestamp ||
        new Date().toISOString();

      updateLastMessage(groupId, textContent, timestamp);
    };

    socket.on("receiveGroupMessage", handleReceiveGroupMessage);

    return () => {
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
    };
  }, [selectedUser, updateLastMessage]);

  useEffect(() => {
    const handleGroupMessageDeleted = (payload) => {
      if (!payload) return;

      const targetId =
        payload.messageId || payload.data?.messageId || payload.id;
      if (!targetId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(targetId)
            ? {
                ...msg,
                deletedForEveryone: true,
                message: "This message was deleted",
                fileUrl: "",
                fileName: "",
                fileType: "",
              }
            : msg,
        ),
      );
    };

    socket.on("groupMessageDeletedEveryone", handleGroupMessageDeleted);

    return () => {
      socket.off("groupMessageDeletedEveryone", handleGroupMessageDeleted);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      setChatLoading(true);
      let data;

      if (selectedUser.type === "group") {
        data = await getGroupMessages(selectedUser._id);
        setMessages(data?.messages || []);
        return;
      }

      data = await getMessages(selectedUser._id);
      setMessages(data?.messages || []);

      if (data?.messages) {
        for (const message of data.messages) {
          if (
            String(message.receiverId) === String(user.id) &&
            message.status === "sent"
          ) {
            await markAsDelivered(message._id);
          }

          if (
            String(message.receiverId) === String(user.id) &&
            message.status === "delivered"
          ) {
            await markAsRead(message._id);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);

    if (!selectedUser) return;

    if (selectedUser.type === "group") {
      socket.emit("groupTyping", {
        senderId: user.id,
        groupId: selectedUser._id,
      });
    } else {
      socket.emit("typing", {
        senderId: user.id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setIsUploading(true);
      let data;

      if (selectedUser.type === "group") {
        data = await sendGroupMessage(
          selectedUser._id,
          newMessage,
          selectedFile,
        );

        if (data?.data) {
          socket.emit("sendMessageToGroup", {
            groupId: selectedUser._id,
            message: data.data,
          });
        }
      } else {
        data = await sendMessage(selectedUser._id, newMessage, selectedFile);
      }

      if (data?.data) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.data._id);
          if (exists) return prev;
          return [...prev, data.data];
        });

        const textContent =
          data.data.message ||
          data.data.text ||
          (data.data.file ? "📎 Attachment" : "");

        const timestamp = data.data.createdAt || new Date().toISOString();

        updateLastMessage(selectedUser._id, textContent, timestamp);
      }

      setNewMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await deleteForMe(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await deleteForEveryone(messageId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deletedForEveryone: true,
                message: "This message was deleted",
                fileUrl: "",
                fileName: "",
                fileType: "",
              }
            : msg,
        ),
      );

      if (selectedUser && selectedUser.type === "group") {
        socket.emit("deleteGroupMessageEveryone", {
          groupId: selectedUser._id,
          messageId: messageId,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-700">
            Welcome {user?.name}
          </h2>

          <p className="text-gray-500 mt-3">
            Select a user or group to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <ChatHeader
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
        setSelectedUser={setSelectedUser}
        isTyping={isTyping}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <MessageList
        messages={messages}
        chatLoading={chatLoading}
        user={user}
        messagesEndRef={messagesEndRef}
        searchText={searchText}
        handleDeleteForMe={handleDeleteForMe}
        handleDeleteForEveryone={handleDeleteForEveryone}
      />

      <MessageInput
        newMessage={newMessage}
        handleTyping={handleTyping}
        handleSendMessage={handleSendMessage}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isUploading={isUploading}
      />
    </div>
  );
};

export default ChatContainer;
