import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import socket from "../services/socket";

import { getAllUsers } from "../services/userService";
import { getGroups } from "../services/groupService";

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

  useEffect(() => {
    if (!user) return;

    fetchUsers();
    fetchGroups();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.emit("registerUser", user.id);

    if (groups && groups.length > 0) {
      groups.forEach((group) => {
        socket.emit("joinGroup", group._id);
      });
    }

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
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
      socket.off("receiveGroupMessage");
      socket.off("userTyping");
      socket.off("groupCreated");

      socket.disconnect();
    };
  }, [user, groups?.length]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await getAllUsers();

      const filteredUsers = data.users.filter((item) => item._id !== user?.id);

      setUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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

  const updateLastMessage = (id, message, time) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((item) =>
        item._id === id
          ? {
              ...item,
              lastMessage: message,
              lastMessageTime: time,
            }
          : item,
      );

      updatedUsers.sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });

      return updatedUsers;
    });

    setGroups((prevGroups) => {
      const updatedGroups = prevGroups.map((group) =>
        group._id === id
          ? {
              ...group,
              lastMessage: message,
              lastMessageTime: time,
            }
          : group,
      );

      updatedGroups.sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });

      return updatedGroups;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-700 overflow-hidden antialiased selection:bg-teal-500/20">
      <div className="h-full w-full p-0 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col justify-center">
        <div className="h-full w-full bg-white/70 backdrop-blur-md sm:rounded-3xl border border-white/80 shadow-2xl shadow-slate-200/80 overflow-hidden flex relative">
          <div
            className={`h-full w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r border-slate-100/80 transition-all duration-300 ${selectedUser ? "hidden md:flex" : "flex"}`}
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
            />
          </div>

          <div
            className={`h-full flex-grow transition-all duration-300 bg-white/40 ${!selectedUser ? "hidden md:flex" : "flex"}`}
          >
            <ChatContainer
              user={user}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              onlineUsers={onlineUsers}
              updateLastMessage={updateLastMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
