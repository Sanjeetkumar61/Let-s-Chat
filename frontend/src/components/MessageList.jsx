import React from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({
  messages,
  chatLoading,
  user,
  messagesEndRef,
  searchText,
  handleDeleteForMe,
  handleDeleteForEveryone,
}) => {
  const filteredMessages = messages.filter((msg) => {
    if (!searchText) return true;

    return (
      msg.message &&
      msg.message.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    /* Removed p-5 completely; applied compact vertical layout with edge-to-edge horizontal limits */
    <div className="flex-1 overflow-y-auto w-full px-0 py-2 space-y-1 hide-scrollbar">
      {chatLoading ? (
        <p className="text-center text-gray-400 mt-4 text-sm">
          Loading messages...
        </p>
      ) : filteredMessages.length > 0 ? (
        filteredMessages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            currentUser={user}
            searchText={searchText}
            handleDeleteForMe={handleDeleteForMe}
            handleDeleteForEveryone={handleDeleteForEveryone}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10">
          {searchText ? "No matching messages found" : "No messages yet"}
        </div>
      )}

      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default MessageList;
