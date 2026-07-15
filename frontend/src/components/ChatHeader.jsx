import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { HiUserGroup } from "react-icons/hi2";
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

const ChatHeader = ({
  selectedUser,
  onlineUsers,
  setSelectedUser,
  isTyping,
  searchText,
  setSearchText,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const isGroup = selectedUser.type === "group";
  const isOnline = !isGroup ? onlineUsers.includes(selectedUser._id) : false;

  const handleAvatarClick = () => {
    if (isGroup) {
      setShowGroupInfo(true);
    } else {
      setShowUserInfo(true);
    }
  };

  return (
    <>
      <div className="bg-white/60 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 h-[73px] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-xl cursor-pointer transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3 overflow-hidden">
            <div
              onClick={handleAvatarClick}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-transform active:scale-95 cursor-pointer ${getAvatarBgColor(selectedUser._id || selectedUser.name, isGroup)}`}
            >
              {isGroup ? (
                <HiUserGroup size={20} />
              ) : (
                <span className="text-sm font-bold uppercase tracking-wider">
                  {selectedUser.name.charAt(0)}
                </span>
              )}
            </div>

            <div
              onClick={handleAvatarClick}
              className="overflow-hidden flex flex-col justify-center cursor-pointer group"
            >
              <h2 className="text-sm sm:text-base font-semibold text-slate-700 truncate leading-snug group-hover:text-sky-600 transition-colors">
                {selectedUser.name}
              </h2>

              <div className="flex items-center gap-1.5 mt-0.5">
                {!isGroup && isOnline && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 transition-colors duration-300" />
                )}

                <p
                  className={`text-xs truncate ${
                    isTyping
                      ? "text-teal-500 font-semibold animate-pulse"
                      : "text-slate-400"
                  }`}
                >
                  {isGroup
                    ? `${selectedUser.members?.length || 0} Members`
                    : isTyping
                      ? "typing..."
                      : isOnline
                        ? "Online"
                        : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end max-w-[240px] sm:max-w-[280px] flex-1">
          {showSearch ? (
            <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="relative flex items-center w-full">
                <span className="absolute left-3 text-slate-400">
                  <FiSearch size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-5 py-1.5 bg-slate-50/80 border border-slate-100 rounded-lg outline-none text-xs font-medium text-slate-700 placeholder-slate-400 transition-all focus:bg-white focus:border-teal-400"
                  autoFocus
                />
              </div>

              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchText("");
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-slate-50"
              >
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-slate-400 hover:text-teal-500 transition-all cursor-pointer rounded-xl hover:bg-slate-50 active:scale-95"
            >
              <FiSearch size={20} />
            </button>
          )}
        </div>
      </div>

      <GroupInfoModal
        open={showGroupInfo}
        groupId={selectedUser?._id}
        onClose={() => setShowGroupInfo(false)}
      />

      <UserInfoModal
        open={showUserInfo}
        user={selectedUser}
        isOnline={isOnline}
        onClose={() => setShowUserInfo(false)}
      />
    </>
  );
};

export default ChatHeader;
