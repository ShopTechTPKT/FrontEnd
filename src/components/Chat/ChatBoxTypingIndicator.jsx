import React from "react";

export default function ChatBoxTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-3">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="ml-2 text-xs text-gray-500">AI đang soạn tin...</span>
    </div>
  );
}
