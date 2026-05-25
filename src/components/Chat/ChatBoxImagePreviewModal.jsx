import React from "react";

export default function ChatBoxImagePreviewModal({
  show,
  selectedImages,
  isUploading,
  onClose,
  onClear,
  onConfirm,
  theme,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-center text-lg font-bold">Xác nhận so sánh</h3>

        {selectedImages && selectedImages.length > 0 ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-4">
              {selectedImages.map((image, idx) => (
                <div key={idx} className="text-center">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${idx + 1}`}
                    className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ảnh {idx + 1}</p>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button onClick={onClear} className="flex-1 rounded-lg bg-gray-200 py-2 text-gray-800 transition-colors hover:bg-gray-300">
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-lg py-2 ${theme.buttonBg} ${theme.textPrimary} ${theme.buttonHover} transition-all`}
                disabled={isUploading}
              >
                {isUploading ? "Đang xử lý..." : "So sánh"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-gray-500">Không có ảnh nào được chọn</p>
            <button onClick={onClear} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300">
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
