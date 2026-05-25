import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";
import ChatBoxMessageBubble from "./Chat/ChatBoxMessageBubble";
import ChatBoxInput from "./Chat/ChatBoxInput";
import ChatBoxButton from "./Chat/ChatBoxButton";
import ChatBoxImagePreviewModal from "./Chat/ChatBoxImagePreviewModal";
import ChatBoxTypingIndicator from "./Chat/ChatBoxTypingIndicator";
import { useChatBot } from "../hooks/useChatBot";

const ChatBox = () => {
  const { isCustomerService } = useContext(UserContext);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    messages, input, setInput, loading, isTyping, selectedImages, setSelectedImages, 
    isUploading, showImagePreview, setShowImagePreview, setCompareMode, fileInputRef, 
    fileInputRefMultiple, sendMessage, handleCompareImages, handleFileSelect
  } = useChatBot();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (isCustomerService) return null;

  if (currentPath.startsWith('/admin') ||
      currentPath.startsWith('/employee') || 
      currentPath.startsWith('/customer-service') ||
      currentPath.startsWith('/admin/audit-logs')) {
    return null;
  }

  const theme = {
    textPrimary: "text-white",
    buttonBg: "bg-violet-600",
    buttonHover: "hover:bg-violet-700",
    animateColor: "bg-violet-600",
    accentGlow: "shadow-lg shadow-violet-500/20"
  };

  const quickQuestions = [
    "Sản phẩm bán chạy hôm nay",
    "Laptop dưới 20 triệu",
    "Tư vấn PC văn phòng",
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <ChatBoxButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            onClick={() => setOpen(true)}
          />
        )}

        {open && (
          <div className="fixed bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[clamp(400px,70vh,600px)] flex flex-col rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-fadeIn">
            <div className="relative px-6 py-5 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-white dark:from-violet-900/40 dark:via-fuchsia-900/20 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-gray-200">
                    <img src="https://cdn-icons-png.flaticon.com/512/14958/14958350.png" alt="AI Assistant" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hỗ trợ khách hàng</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Luôn sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setOpen(false)} className="focus:outline-none p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600" aria-label="Đóng">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900" ref={messagesEndRef} >
              {messages.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="mb-4"><span className="text-4xl">👋</span></div>
                  <p className="mb-3 font-semibold text-lg">Chào mừng bạn!</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Mình có thể giúp bạn tìm sản phẩm, so sánh theo ảnh và trả lời nhanh các câu hỏi cơ bản.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <ChatBoxMessageBubble key={index} message={msg} isUser={msg.sender === "user"} theme={theme} />
              ))}
              {isTyping && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md border border-gray-200/60 shadow-lg">
                    <ChatBoxTypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatBoxInput
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              loading={loading}
              isUploading={isUploading}
              quickQuestions={quickQuestions}
              fileInputRef={fileInputRef}
              fileInputRefMultiple={fileInputRefMultiple}
              handleFileSelect={handleFileSelect}
            />

            <ChatBoxImagePreviewModal
              show={showImagePreview}
              selectedImages={selectedImages}
              isUploading={isUploading}
              onClose={() => setShowImagePreview(false)}
              onClear={() => {
                setShowImagePreview(false);
                setSelectedImages([]);
                setCompareMode(false);
              }}
              onConfirm={() => handleCompareImages(selectedImages)}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
