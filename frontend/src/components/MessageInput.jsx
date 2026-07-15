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

  const isImage = selectedFile && selectedFile.type.startsWith("image/");

  return (
    <div className="relative bg-white border-t px-5 py-4">
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl overflow-hidden"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mb-4 bg-slate-100 rounded-xl p-3 relative">
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 cursor-pointer"
          >
            <MdClose size={22} />
          </button>

          {isImage ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-h-56 rounded-lg mx-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <FaRegFileAlt size={36} className="text-teal-500" />

              <div>
                <p className="font-medium text-gray-700">{selectedFile.name}</p>

                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 shadow-sm">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-2xl text-gray-500 hover:text-teal-500 transition cursor-pointer"
        >
          <BsEmojiSmile />
        </button>

        <button
          onClick={() => fileInputRef.current.click()}
          className="ml-3 text-xl text-gray-500 hover:text-teal-500 transition cursor-pointer"
        >
          <BsPaperclip />
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
            if (e.key === "Enter" && (newMessage.trim() || selectedFile)) {
              handleSendMessage();
            }
          }}
          className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 placeholder:text-gray-400"
        />

        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() && !selectedFile}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
            newMessage.trim() || selectedFile
              ? "bg-teal-500 hover:bg-teal-600 text-white shadow-md"
              : "bg-white text-gray-500 border border-gray-300"
          }`}
        >
          <IoSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
