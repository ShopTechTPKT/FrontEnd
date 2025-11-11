const ChatMessage = ({ message }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
  const fileUrl = message.fileUrl 
    ? (message.fileUrl.startsWith("http") 
        ? message.fileUrl 
        : `${API_URL.replace("/api", "")}${message.fileUrl}`)
    : null;

  return (
    <div
      className={`flex ${
        message.senderType === "STAFF" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm transition-all ${
          message.senderType === "STAFF"
            ? "bg-gradient-to-r from-black via-gray-900 to-purple-950 text-white rounded-br-sm"
            : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}
      >
        <p className="text-xs font-medium mb-0.5 opacity-70">
          {message.senderName}
        </p>
        {fileUrl && (
          <div className="mb-2 rounded-lg overflow-hidden">
            {message.fileType === "IMAGE" ? (
              <img
                src={fileUrl}
                alt="Chat image"
                className="max-w-full h-auto max-h-64 object-contain rounded-lg cursor-pointer"
                onClick={() => window.open(fileUrl, "_blank")}
              />
            ) : message.fileType === "VIDEO" ? (
              <video
                src={fileUrl}
                controls
                className="max-w-full h-auto max-h-64 rounded-lg"
              >
                Trình duyệt không hỗ trợ video.
              </video>
            ) : null}
          </div>
        )}
        {message.content && (
          <p className="text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
};
  
  export default ChatMessage;