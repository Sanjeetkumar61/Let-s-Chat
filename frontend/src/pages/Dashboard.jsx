import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import socket from "../services/socket";

import { getAllUsers } from "../services/userService";
import { getGroups } from "../services/groupService";
import { getUnreadCounts } from "../services/messageService";

import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const unreadCountsStorageKey = user ? `unreadCounts:${user.id}` : null;

  useEffect(() => {
    if (!unreadCountsStorageKey) return;
    try {
      const storedCounts = localStorage.getItem(unreadCountsStorageKey);
      if (storedCounts) {
        setUnreadCounts(JSON.parse(storedCounts) || {});
      }
    } catch (error) {
      console.log(error);
    }
  }, [unreadCountsStorageKey]);

  useEffect(() => {
    if (!unreadCountsStorageKey) return;
    try {
      localStorage.setItem(
        unreadCountsStorageKey,
        JSON.stringify(unreadCounts),
      );
    } catch (error) {
      console.log(error);
    }
  }, [unreadCounts, unreadCountsStorageKey]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchGroups(), fetchUnreadCounts()]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit("registerUser", user.id);

    if (groups.length > 0) {
      groups.forEach((group) => {
        socket.emit("joinGroup", group._id);
      });
    }

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (message) => {
      if (!message) return;
      if (String(message.receiverId) !== String(user.id)) return;
      if (selectedUser && String(selectedUser._id) === String(message.senderId))
        return;

      const senderId = String(message.senderId);
      setUnreadCounts((prev) => ({
        ...prev,
        [senderId]: Number(prev[senderId] || 0) + 1,
      }));
    });

    socket.on("receiveGroupMessage", ({ groupId, message }) => {
      const textContent =
        message.text || (message.file ? "📎 File attachment" : "");
      updateLastMessage(
        groupId,
        textContent,
        message.createdAt || new Date().toISOString(),
      );
    });

    socket.on("userTyping", ({ senderId }) => {
      setTypingUsers((prev) => {
        if (prev.includes(senderId)) return prev;
        return [...prev, senderId];
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== senderId));
      }, 1000);
    });

    socket.on("groupCreated", (group) => {
      socket.emit("joinGroup", group._id);
      setGroups((prev) => {
        const exists = prev.some((g) => g._id === group._id);
        if (exists) return prev;
        return [group, ...prev];
      });
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("receiveMessage");
      socket.off("receiveGroupMessage");
      socket.off("userTyping");
      socket.off("groupCreated");
      socket.disconnect();
    };
  }, [user, groups.length, selectedUser]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const filteredUsers = data.users.filter((item) => item._id !== user?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data.groups);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const data = await getUnreadCounts();
      setUnreadCounts((prev) => {
        const serverCounts = data.counts || {};
        if (Object.keys(serverCounts).length === 0) return prev;
        return { ...prev, ...serverCounts };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const clearUnreadCount = (chatId) => {
    if (!chatId) return;
    setUnreadCounts((prev) => {
      if (!prev?.[chatId]) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  };

  const updateLastMessage = (id, message, time) => {
    const sortFn = (a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    };

    setUsers((prevUsers) => {
      const updated = prevUsers.map((item) =>
        item._id === id
          ? { ...item, lastMessage: message, lastMessageTime: time }
          : item,
      );
      return [...updated].sort(sortFn);
    });

    setGroups((prevGroups) => {
      const updated = prevGroups.map((group) =>
        group._id === id
          ? { ...group, lastMessage: message, lastMessageTime: time }
          : group,
      );
      return [...updated].sort(sortFn);
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen fixed inset-0 bg-slate-100 font-sans text-slate-700 overflow-hidden antialiased flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
      {/* Main Container Card Frame */}
      <div className="w-full h-full max-w-[1600px] bg-white rounded-none sm:rounded-3xl border border-slate-200/60 shadow-2xl overflow-hidden flex min-h-0">
        {/* SIDEBAR: Pinned on desktop (md+). Hidden on mobile ONLY if a user is actively selected */}
        <div
          className={`h-full w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r border-slate-100 flex flex-col ${
            selectedUser ? "hidden md:flex" : "flex"
          }`}
        >
          <Sidebar
            user={user}
            users={users.filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            )}
            groups={groups}
            refreshGroups={fetchGroups}
            loading={loading}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            onlineUsers={onlineUsers}
            typingUsers={typingUsers}
            handleLogout={handleLogout}
            search={search}
            setSearch={setSearch}
            unreadCounts={unreadCounts}
          />
        </div>

        {/* CHAT CONTAINER: Fills remaining room on desktop. Fills complete screen on mobile if chat selected */}
        <div
          className={`h-full flex-grow min-h-0 overflow-hidden bg-slate-50/50 ${
            !selectedUser ? "hidden md:flex" : "flex flex-col"
          }`}
        >
          <ChatContainer
            user={user}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            onlineUsers={onlineUsers}
            updateLastMessage={updateLastMessage}
            updateUnreadCounts={fetchUnreadCounts}
            clearUnreadCount={clearUnreadCount}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
