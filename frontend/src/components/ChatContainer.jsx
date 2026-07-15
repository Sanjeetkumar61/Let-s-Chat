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
  updateUnreadCounts,
  clearUnreadCount,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      setSearchTerm("");
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = async (message) => {
      if (!message) return;
      const isCurrentChat =
        selectedUser && String(message.senderId) === String(selectedUser._id);
      const isIncomingForCurrentUser =
        String(message.receiverId) === String(user.id);

      if (isCurrentChat) {
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
      const timestamp = message.createdAt || new Date().toISOString();
      const chatId =
        String(message.senderId) === String(user.id)
          ? message.receiverId
          : message.senderId;

      updateLastMessage(chatId, textContent, timestamp);

      if (isIncomingForCurrentUser) {
        try {
          if (message.status === "sent") await markAsDelivered(message._id);
          if (isCurrentChat) await markAsRead(message._id);
          await updateUnreadCounts?.();
        } catch (error) {
          console.log(error);
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedUser, updateLastMessage, user, updateUnreadCounts]);

  useEffect(() => {
    const handleUserTyping = ({ senderId }) => {
      if (String(selectedUser?._id) !== String(senderId)) return;
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
    };
    socket.on("userTyping", handleUserTyping);
    return () => socket.off("userTyping", handleUserTyping);
  }, [selectedUser]);

  useEffect(() => {
    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg,
        ),
      );
    };
    socket.on("messageDelivered", handleMessageDelivered);
    return () => socket.off("messageDelivered", handleMessageDelivered);
  }, []);

  useEffect(() => {
    const handleMessageRead = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg,
        ),
      );
    };
    socket.on("messageRead", handleMessageRead);
    return () => socket.off("messageRead", handleMessageRead);
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
    return () => socket.off("messageDeletedEveryone", handleDeleteEveryone);
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
    return () => socket.off("receiveGroupMessage", handleReceiveGroupMessage);
  }, [selectedUser, updateLastMessage]);

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      setChatLoading(true);
      if (selectedUser.type === "group") {
        const data = await getGroupMessages(selectedUser._id);
        setMessages(data?.messages || []);
        return;
      }

      const data = await getMessages(selectedUser._id);
      setMessages(data?.messages || []);

      if (data?.messages) {
        for (const message of data.messages) {
          if (
            String(message.receiverId) === String(user.id) &&
            message.status !== "read"
          ) {
            if (message.status === "sent") await markAsDelivered(message._id);
            await markAsRead(message._id);
          }
        }
        clearUnreadCount?.(selectedUser._id);
        await updateUnreadCounts?.();
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
        const chatId =
          selectedUser.type === "group"
            ? selectedUser._id
            : data.data.receiverId;
        updateLastMessage(chatId, textContent, timestamp);
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
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/60 h-full w-full p-8 text-center">
        <h2 className="text-3xl font-bold text-slate-700 tracking-tight">
          Welcome {user?.name || "User"}
        </h2>
        <p className="text-slate-400 mt-2 text-sm max-w-sm">
          Select a user or group from the list to start catching up.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 md:relative flex flex-col flex-1 h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50/40 w-full max-w-full">
      {/* 1. HEADER (Keeps internal padding for content but fills width) */}
      <div className="flex-shrink-0 w-full bg-white px-4 py-2 sm:px-6 sm:py-2.5 z-10 shadow-sm">
        <ChatHeader
          selectedUser={selectedUser}
          onlineUsers={onlineUsers}
          setSelectedUser={setSelectedUser}
          isTyping={isTyping}
          searchText={searchTerm}
          setSearchText={setSearchTerm}
        />
      </div>

      {/* 2. DYNAMIC MESSAGE AREA (Paddings completely removed so bubbles can touch edges) */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full px-0 py-2">
        <MessageList
          messages={messages}
          chatLoading={chatLoading}
          user={user}
          messagesEndRef={messagesEndRef}
          searchText={debouncedSearchText}
          handleDeleteForMe={handleDeleteForMe}
          handleDeleteForEveryone={handleDeleteForEveryone}
        />
      </div>

      {/* 3. PINNED BOTTOM ACTION BAR (Padding set to px-0 so input component touches borders) */}
      <div className="flex-shrink-0 w-full border-t border-slate-100 bg-white px-0 pt-2 pb-6 sm:pb-4 md:pb-4 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <MessageInput
          newMessage={newMessage}
          handleTyping={handleTyping}
          handleSendMessage={handleSendMessage}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
