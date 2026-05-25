import React, { memo } from "react";

const ChatBoxMessageBubble = memo(function ChatBoxMessageBubble({ message, isUser, theme }) {
  return (
    <div className={`group mb-6 ${isUser ? "text-right" : "text-left"} animate-fadeIn`}>
      <div className="flex items-start space-x-2">
        {!isUser && (
          <div className={`h-8 w-8 rounded-full ${theme.buttonBg} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
            AI
          </div>
        )}
        <div className="flex-1">
          <div
            className={`inline-block max-w-[80%] rounded-2xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${
              isUser
                ? `${theme.buttonBg} ${theme.textPrimary} ml-auto rounded-br-md border-white/20`
                : "rounded-bl-md border-gray-200/60 bg-white/80 text-gray-800"
            }`}
          >
            <div className="relative z-10">
              {message.type === "image" && message.image && (
                <div className="mb-2">
                  <img src={message.image} alt="Uploaded" className="max-w-[200px] rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}

              {message.type === "compare" && message.images && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {message.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Compare ${idx + 1}`} className="h-20 w-20 rounded-lg border border-gray-200 object-cover shadow-sm" />
                  ))}
                </div>
              )}

              {message.text}
            </div>
          </div>
          <div className={`mt-1 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 ${isUser ? "text-right" : "text-left"}`}>
            {message.timestamp?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        {isUser && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-700 to-violet-600 text-sm font-bold text-white shadow-lg">
            Bạn
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatBoxMessageBubble;
