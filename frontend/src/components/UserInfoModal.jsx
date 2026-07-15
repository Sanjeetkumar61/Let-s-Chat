import React from "react";
import { FiX, FiMail, FiInfo, FiCalendar } from "react-icons/fi";

const getAvatarBgColor = (id) => {
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

const UserInfoModal = ({ open, user, isOnline, onClose }) => {
  if (!open || !user) return null;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="relative h-28 bg-gradient-to-r from-teal-500 to-sky-500 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/10 hover:bg-black/20 text-white rounded-full p-1.5 transition cursor-pointer backdrop-blur-xs"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 relative flex flex-col items-center">
          <div className="absolute -top-12 flex justify-center">
            <div
              className={`w-24 h-24 rounded-2xl border-4 border-white text-white flex items-center justify-center text-3xl font-bold uppercase shadow-lg ${getAvatarBgColor(user._id || user.name)}`}
            >
              {user.name?.charAt(0)}
            </div>
          </div>

          <div className="mt-14 text-center w-full">
            <h2 className="text-xl font-bold text-slate-800 truncate">
              {user.name}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 ring-4 ring-emerald-400/20" : "bg-slate-300"}`}
              />
              <span
                className={`text-xs font-semibold ${isOnline ? "text-emerald-500" : "text-slate-400"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className="w-full border-t border-slate-100 mt-6 pt-5 space-y-4">
            <div className="flex items-start gap-3.5 px-1 text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-100">
                <FiInfo size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Bio
                </p>
                <p className="text-xs text-slate-600 font-medium mt-0.5 break-words whitespace-pre-wrap leading-relaxed">
                  {user.bio || "Hey there! I am using LetsChat."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-1 text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-100">
                <FiMail size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-xs text-slate-700 font-semibold mt-0.5 truncate">
                  {user.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-1 text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-100">
                <FiCalendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-xs text-slate-700 font-semibold mt-0.5 truncate">
                  {joinedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
