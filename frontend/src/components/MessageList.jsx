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
    <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
      {chatLoading ? (
        <p>Loading messages...</p>
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
          No matching messages found
        </div>
      )}

      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default MessageList;
