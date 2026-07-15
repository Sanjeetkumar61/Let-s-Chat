import React, { useState, useEffect } from "react";
import { HiUserGroup } from "react-icons/hi2";
import logo from "../assets/logo.svg";
import CreateGroupModal from "./CreateGroupModal";
import GroupInfoModal from "./GroupInfoModal";
import UserInfoModal from "./UserInfoModal";

const getAvatarBgColor = (id, isGroup) => {
  if (isGroup) return "bg-sky-500";

  const colors = [
    "bg-teal-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-indigo-600",
    "bg-rose-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-fuchsia-600",
  ];

  let hash = 0;
  const stringId = String(id || "");
  for (let i = 0; i < stringId.length; i++) {
    hash = stringId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const Sidebar = ({
  user,
  users,
  groups = [],
  refreshGroups,
  loading,
  selectedUser,
  setSelectedUser,
  onlineUsers,
  typingUsers = [],
  handleLogout,
  search,
  setSearch,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [localSearch, setLocalSearch] = useState(search || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 305);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, setSearch]);

  const handleGroupCreated = () => {
    refreshGroups();
  };

  const handleAvatarClick = (e, item, isGroup) => {
    e.stopPropagation();
    setPreviewItem(item);
    if (isGroup) {
      setShowGroupInfo(true);
    } else {
      setShowUserInfo(true);
    }
  };

  const chats = [
    ...users.map((u) => ({
      ...u,
      type: "user",
    })),

    ...groups.map((g) => ({
      ...g,
      type: "group",
    })),
  ].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.createdAt || 0);
    const timeB = new Date(b.lastMessageTime || b.createdAt || 0);

    return timeB - timeA;
  });

  const filteredChats = chats.filter((item) => {
    const name = item.name || "";
    return name.toLowerCase().includes((search || "").toLowerCase());
  });

  return (
    <>
      <div
        className={`${
          selectedUser ? "hidden md:flex" : "flex"
        } w-full h-full flex-col bg-white`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 bg-white rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-xs p-1">
                <img
                  src={logo}
                  alt="LetsChat Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div className="truncate">
                <h1 className="text-2xl font-extrabold text-emerald-800 tracking-tight leading-none">
                  Let's<span className="text-sky-500"> Chat</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-slate-500 hover:text-slate-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6h.01M12 12h.01M12 18h.01"
                  />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 transition cursor-pointer flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center mt-4">
            <span className="absolute left-4 text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search users or groups..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 shadow-md shadow-teal-500/10 transition-all duration-200 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span>New Group</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center pt-12 text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Loading Chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center pt-12 px-4">
              <p className="text-xs font-medium text-slate-400">
                No conversations found
              </p>
            </div>
          ) : (
            filteredChats.map((item) => {
              const isGroup = item.type === "group";
              const isOnline = !isGroup
                ? onlineUsers.includes(item._id)
                : false;
              const isSelected = selectedUser?._id === item._id;

              let typingText = "";
              let isCurrentlyTyping = false;

              if (isGroup) {
                const groupTypingObj = typingUsers.find(
                  (t) =>
                    typeof t === "object" &&
                    String(t.groupId) === String(item._id),
                );
                if (groupTypingObj) {
                  const typingUserObj = users.find(
                    (u) => String(u._id) === String(groupTypingObj.senderId),
                  );
                  typingText = typingUserObj
                    ? `${typingUserObj.name} is typing...`
                    : "Someone is typing...";
                  isCurrentlyTyping = true;
                }
              } else {
                isCurrentlyTyping =
                  typingUsers.includes(item._id) ||
                  typingUsers.some(
                    (t) =>
                      typeof t === "object" &&
                      String(t.senderId) === String(item._id) &&
                      !t.groupId,
                  );
                if (isCurrentlyTyping) {
                  typingText = "typing...";
                }
              }

              const groupDisplayMessage =
                item.lastMessage ||
                item.latestMessage ||
                item.lastMessageText ||
                `${item.members?.length || 0} Members`;
              const unreadCount = item.unreadCount || 0;

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedUser(item)}
                  className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all duration-150 relative ${
                    isSelected ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
                    <div
                      onClick={(e) => handleAvatarClick(e, item, isGroup)}
                      className="relative flex-shrink-0 group cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm text-white transition-transform active:scale-95 ${getAvatarBgColor(item._id || item.name, isGroup)}`}
                      >
                        {isGroup ? (
                          <HiUserGroup size={20} />
                        ) : (
                          <span className="uppercase tracking-wider">
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {!isGroup && isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-400 transition-colors duration-300" />
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-sm text-slate-700 truncate">
                          {item.name}
                        </h3>
                        {(item.lastMessageTime || item.createdAt) && (
                          <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                            {new Date(
                              item.lastMessageTime || item.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate flex-1 ${
                            isCurrentlyTyping
                              ? "text-emerald-500 font-semibold animate-pulse"
                              : "text-slate-400"
                          }`}
                        >
                          {isCurrentlyTyping
                            ? typingText
                            : isGroup
                              ? groupDisplayMessage
                              : item.lastMessage ||
                                (isOnline ? "Online" : "Offline")}
                        </p>

                        {!isSelected && unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateGroupModal
        open={showCreateGroup}
        users={users}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />

      <GroupInfoModal
        open={showGroupInfo}
        groupId={previewItem?._id}
        onClose={() => {
          setShowGroupInfo(false);
          setPreviewItem(null);
        }}
      />

      <UserInfoModal
        open={showUserInfo}
        user={previewItem}
        isOnline={previewItem ? onlineUsers.includes(previewItem._id) : false}
        onClose={() => {
          setShowUserInfo(false);
          setPreviewItem(null);
        }}
      />
    </>
  );
};

export default Sidebar;
