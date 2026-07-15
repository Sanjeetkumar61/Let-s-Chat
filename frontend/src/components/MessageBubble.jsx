import { useState, useRef, useEffect } from "react";
import Linkify from "linkify-react";
import {
  MdDone,
  MdDoneAll,
  MdInsertDriveFile,
  MdOpenInNew,
  MdDownload,
  MdDeleteOutline,
} from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";

import ImagePreviewModal from "./ImagePreviewModal";
import { downloadFile, openFile } from "../services/messageService";

const MessageBubble = ({
  message,
  currentUser,
  handleDeleteForMe,
  handleDeleteForEveryone,
}) => {
  const senderId = String(message.senderId?._id || message.senderId);
  const isSender = senderId === String(currentUser.id);

  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onlyEmoji =
    message.message && /^[\p{Emoji}\s]+$/u.test(message.message.trim());

  const isImage = message.fileType?.startsWith("image/");
  const isDeleted = message.deletedForEveryone;

  const renderStatus = () => {
    if (!isSender) return null;

    switch (message.status) {
      case "read":
        return (
          <MdDoneAll
            size={15}
            className={isDeleted ? "text-slate-500" : "text-blue-600"}
          />
        );
      case "delivered":
        return (
          <MdDoneAll
            size={15}
            className={isDeleted ? "text-slate-500" : "text-slate-700"}
          />
        );
      default:
        return (
          <MdDone
            size={15}
            className={isDeleted ? "text-slate-500" : "text-slate-700"}
          />
        );
    }
  };

  return (
    <>
      <div
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3 px-4 relative`}
      >
        <div
          className={`relative max-w-[85%] sm:max-w-[75%] group rounded-2xl pl-4 pr-10 py-2.5 shadow-sm ${
            isDeleted
              ? "bg-slate-50 border border-slate-100 text-slate-400 !pr-4"
              : isSender
                ? "bg-teal-500 text-white rounded-br-none"
                : "bg-slate-300 text-slate-800 rounded-bl-none"
          }`}
        >
          {!isDeleted && (
            <div ref={menuRef} className="absolute right-2 top-2.5 z-20">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className={`cursor-pointer p-1 rounded-md transition ${
                  isSender
                    ? "text-teal-100 hover:bg-teal-600 hover:text-white"
                    : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                }`}
              >
                <HiOutlineDotsVertical size={16} />
              </button>

              {showMenu && (
                <div
                  className={`absolute top-7 z-50 min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden ${
                    isSender ? "right-0" : "left-0"
                  }`}
                >
                  <button
                    onClick={() => {
                      handleDeleteForMe(message._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer transition whitespace-nowrap"
                  >
                    <MdDeleteOutline size={16} className="flex-shrink-0" />
                    Delete for Me
                  </button>

                  {isSender && (
                    <button
                      onClick={() => {
                        handleDeleteForEveryone(message._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 text-xs font-semibold text-red-500 cursor-pointer transition border-t border-slate-50 whitespace-nowrap"
                    >
                      <MdDeleteOutline size={16} className="flex-shrink-0" />
                      Delete for Everyone
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isDeleted && message.fileUrl && isImage && (
            <img
              src={message.fileUrl}
              alt={message.fileName}
              onClick={() => setShowPreview(true)}
              className="rounded-xl mb-1.5 max-h-56 sm:max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition"
            />
          )}

          {!isDeleted && message.fileUrl && !isImage && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-1.5 w-64 max-w-full shadow-sm">
              <div className="flex items-center gap-2.5 p-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <MdInsertDriveFile size={22} className="text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-700 truncate">
                    {message.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    {message.fileType ? message.fileType.split("/")[1] : "FILE"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => openFile(message._id, message.fileType)}
                  className="flex items-center justify-center gap-1 rounded-md border border-blue-200 py-1.5 text-[11px] font-semibold text-blue-600 bg-white hover:bg-blue-50 cursor-pointer transition"
                >
                  <MdOpenInNew size={14} />
                  Open
                </button>

                <button
                  onClick={() => downloadFile(message._id, message.fileName)}
                  className="flex items-center justify-center gap-1 rounded-md bg-teal-500 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-600 cursor-pointer transition"
                >
                  <MdDownload size={14} />
                  Download
                </button>
              </div>
            </div>
          )}

          {message.message &&
            (isDeleted ? (
              <div className="flex items-center gap-1.5 italic text-xs text-slate-400">
                <span>🚫</span>
                <span>This message was deleted</span>
              </div>
            ) : (
              <div
                className={`break-words ${
                  onlyEmoji
                    ? "text-4xl leading-none"
                    : "text-[14px] font-medium leading-relaxed"
                }`}
              >
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "underline font-semibold",
                  }}
                >
                  {message.message}
                </Linkify>
              </div>
            ))}

          <div className="flex justify-end items-center gap-1 mt-1.5 select-none">
            <span
              className={`text-[9px] font-bold ${
                isDeleted
                  ? "text-slate-400"
                  : isSender
                    ? "text-slate-800"
                    : "text-slate-500"
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {renderStatus()}
          </div>
        </div>
      </div>

      <ImagePreviewModal
        image={showPreview ? message.fileUrl : null}
        fileName={message.fileName}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export default MessageBubble;
