import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatMessage from "./ChatMessage";
import { useTranslation } from "react-i18next";

const ChatWindow = ({
  selectedSession,
  messages,
  input,
  setInput,
  handleSend,
  connected,
  messagesEndRef,
  onOpenSchedule, // eslint-disable-line no-unused-vars
  stompClient,
  senderName,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

  // Cleanup preview URL khi component unmount hoặc file thay đổi
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Hàm xóa file và cleanup
  const handleRemoveFile = () => {
    // Cleanup preview URL trước khi xóa
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Chọn file từ thiết bị (chỉ lưu vào state, chưa upload)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      alert("Chỉ chấp nhận file ảnh hoặc video!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File không được vượt quá 50MB!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Cleanup preview URL cũ nếu có
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    // Chỉ lưu file vào state để preview, chưa upload
    setSelectedFile(file);
    // Tạo preview URL
    setFilePreviewUrl(URL.createObjectURL(file));
    
    // Reset input để có thể chọn lại file giống nhau
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload và gửi file
  const uploadAndSendFile = async (file, textContent = "") => {
    if (!file || !stompClient || !stompClient.connected) {
      if (!stompClient || !stompClient.connected) {
        alert("Chưa kết nối đến server. Vui lòng thử lại.");
      }
      return false;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", selectedSession.id);

      const uploadRes = await axios.post(`${API_URL}/chat/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { fileUrl, fileType } = uploadRes.data;
      const fullFileUrl = fileUrl.startsWith("/") 
        ? `${API_URL.replace("/api", "")}${fileUrl}` 
        : fileUrl;

      // Gửi message với file qua WebSocket
      const fileMessage = {
        chatId: selectedSession.id,
        senderType: "STAFF",
        senderName: senderName || t("dashboard.staff_name") || "Nhân viên",
        content: textContent || "",
        fileUrl: fullFileUrl,
        fileType: fileType,
      };
      
      stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(fileMessage));
      
      // Cleanup sau khi upload thành công
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      setSelectedFile(null);
      return true;
    } catch (err) {
      console.error("❌ Lỗi upload file:", err);
      alert("Lỗi khi upload file: " + (err.response?.data?.error || err.message));
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-purple-900 text-white flex items-center justify-center font-semibold text-lg">
            {selectedSession.guestName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-800">
              {selectedSession.guestName}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span>📞</span>
              <span>{selectedSession.guestPhone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-4xl">
              💬
            </div>
            <p className="text-sm text-gray-400">
              {t("chat.no_messages")}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Bắt đầu cuộc trò chuyện
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-white">
        {selectedFile && (
          <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 text-sm font-bold"
              title="Xóa file"
            >
              ✕
            </button>
          </div>
          {/* Preview ảnh */}
          {selectedFile.type.startsWith("image/") && filePreviewUrl && (
            <img
              src={filePreviewUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-40 rounded-lg object-contain"
            />
          )}
          {/* Preview video */}
          {selectedFile.type.startsWith("video/") && filePreviewUrl && (
            <video
              src={filePreviewUrl}
              controls
              className="max-w-full h-auto max-h-40 rounded-lg"
            >
              Trình duyệt không hỗ trợ video.
            </video>
          )}
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!input.trim() && !selectedFile) return;
            
            // Nếu có file, upload và gửi kèm text
            if (selectedFile) {
              const success = await uploadAndSendFile(selectedFile, input.trim());
              if (success) {
                setInput("");
                // File đã được cleanup trong uploadAndSendFile
              }
            } else {
              // Gửi text message bình thường
              handleSend(e);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading || !connected}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !connected}
            className="px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 text-sm"
            title="Gửi ảnh/video"
          >
            {isUploading ? "⏳" : "📎"}
          </button>
          <input
            type="text"
            placeholder={t("chat.enter_message")}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-950/20 focus:border-purple-950 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!connected || isUploading || (!input.trim() && !selectedFile)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
              connected && !isUploading && (input.trim() || selectedFile)
                ? "bg-gradient-to-r from-black via-gray-900 to-purple-950 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUploading ? "⏳" : t("chat.send")}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWindow;