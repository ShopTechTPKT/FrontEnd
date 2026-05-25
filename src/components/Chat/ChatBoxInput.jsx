import React from "react";

export default function ChatBoxInput({
  input,
  setInput,
  sendMessage,
  loading,
  isUploading,
  quickQuestions,
  fileInputRef,
  fileInputRefMultiple,
  handleFileSelect,
}) {
  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full rounded-full border border-gray-200 bg-gray-50/60 px-5 py-3 pr-20 text-sm text-gray-900 transition-all duration-200 placeholder-gray-500 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            disabled={loading || isUploading}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading && !isUploading) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 space-x-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-700"
              disabled={loading || isUploading}
              title="Upload ảnh sản phẩm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={() => fileInputRefMultiple.current?.click()}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-700"
              disabled={loading || isUploading}
              title="So sánh 2 ảnh sản phẩm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm transition-colors duration-200 hover:bg-violet-700 disabled:opacity-50"
          onClick={() => sendMessage()}
          disabled={loading || isUploading}
        >
          {(loading || isUploading) ? (
            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {quickQuestions.map((question) => (
          <button
            key={question}
            onClick={() => sendMessage(question)}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs text-violet-800 transition-colors duration-200 hover:bg-violet-100"
            disabled={loading || isUploading}
          >
            {question}
          </button>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, false)} className="hidden" />
      <input ref={fileInputRefMultiple} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e, true)} className="hidden" />
    </div>
  );
}
