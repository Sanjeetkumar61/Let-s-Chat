import { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile, BsPaperclip } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";

const MessageInput = ({
  newMessage,
  handleTyping,
  handleSendMessage,
  selectedFile,
  setSelectedFile,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiData) => {
    handleTyping(newMessage + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;
    setSelectedFile(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendAction = () => {
    if (newMessage.trim() || selectedFile) {
      handleSendMessage();
    }
  };

  const isImage = selectedFile && selectedFile.type.startsWith("image/");

  return (
    /* Border-to-border layout shell with tight baseline alignment padding */
    <div className="relative w-full bg-white px-3 py-2">
      {/* Absolute full width bounding for emoji selection popover */}
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-16 left-2 right-2 z-50 shadow-2xl rounded-xl overflow-hidden max-w-[calc(100vw-16px)]"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={350}
          />
        </div>
      )}

      {/* Upload preview container */}
      {selectedFile && (
        <div className="mb-2 bg-slate-100 rounded-xl p-3 relative mx-1">
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 cursor-pointer z-10"
          >
            <MdClose size={22} />
          </button>

          {isImage ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-h-40 rounded-lg mx-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <FaRegFileAlt size={32} className="text-teal-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-700 truncate text-sm">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Layout Strip: Full width row items */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex flex-1 items-center bg-slate-100 rounded-full px-3 py-1.5 min-w-0 shadow-sm border border-slate-200/40">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl text-slate-500 hover:text-teal-600 transition flex-shrink-0 cursor-pointer p-1"
          >
            <BsEmojiSmile />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="text-xl text-slate-500 hover:text-teal-600 transition flex-shrink-0 cursor-pointer p-1"
          >
            <BsPaperclip className="rotate-45" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
            onChange={handleFileChange}
          />

          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendAction();
              }
            }}
            className="flex-1 bg-transparent px-2 py-1 outline-none text-slate-700 placeholder:text-gray-400 text-sm border-0 focus:ring-0 min-w-0"
          />
        </div>

        {/* WhatsApp Circular Dynamic Send button */}
        <button
          type="button"
          onClick={handleSendAction}
          disabled={!newMessage.trim() && !selectedFile}
          className={`w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            newMessage.trim() || selectedFile
              ? "bg-teal-600 text-white shadow-md hover:bg-teal-700"
              : "bg-slate-200 text-slate-400 border border-slate-300/20 cursor-not-allowed"
          }`}
        >
          <IoSend size={18} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
