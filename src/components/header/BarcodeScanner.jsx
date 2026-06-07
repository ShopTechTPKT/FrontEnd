import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const GEMINI_PROXY_URL = "http://localhost:8080/api/gemini";

/* ── SVG icon components ── */
const IconImage = ({ className = "h-6 w-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconCamera = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <circle cx="12" cy="13" r="3" strokeWidth={2} />
  </svg>
);

const IconUpload = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconScan = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v2m6-4h2a2 2 0 012 2v2m-6 8H7a2 2 0 01-2-2v-2m6 4h2a2 2 0 002-2v-2M12 8v8m-4-4h8" />
  </svg>
);

const IconClose = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconSearch = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

/* ── Gemini Vision: extract product text from image ── */
const extractTextWithGemini = async (imageDataUrl) => {
  // Strip the data:image/...;base64, prefix to get raw base64
  const base64Data = imageDataUrl.split(",")[1];
  const mimeType = imageDataUrl.match(/data:(.*?);/)?.[1] || "image/jpeg";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `Bạn là hệ thống OCR chuyên đọc thông số sản phẩm công nghệ (laptop, PC, điện thoại, linh kiện).

Hãy đọc TẤT CẢ các chữ và số có trên ảnh này, đặc biệt là:
- Tên thương hiệu / dòng sản phẩm (ví dụ: Acer Nitro V, ASUS ROG, MSI, Dell, HP, Lenovo...)
- CPU (ví dụ: i7-13620H, Ryzen 7 7840HS, Ultra 7 155H...)
- GPU (ví dụ: RTX 2050, RTX 4060, RX 7600M...)
- RAM (ví dụ: 16GB, 32GB...)
- Ổ cứng (ví dụ: 512GB SSD, 1TB...)
- Màn hình (ví dụ: 15.6" Full HD, 14" 2.8K OLED...)

QUY TẮC:
1. Trả về ĐÚNG NGUYÊN VĂN chữ trên ảnh, KHÔNG suy luận hay thêm thông tin.
2. Chỉ trả về 1 dòng text duy nhất, các thông số cách nhau bằng dấu cách.
3. KHÔNG giải thích, KHÔNG format markdown, KHÔNG thêm nhãn.
4. Nếu không đọc được chữ nào, trả về đúng chuỗi: EMPTY

Ví dụ output đúng: Acer Nitro V i7-13620H RTX 2050 16GB 512GB 15.6" Full HD`,
          },
        ],
      },
    ],
  };

  const res = await axios.post(GEMINI_PROXY_URL, payload);
  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || "";
};

export default function BarcodeScanner({ onDetected }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("upload");
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  /* ── OCR: extract text from image using Gemini Vision ── */
  const runOCR = async (imageDataUrl) => {
    setOcrLoading(true);
    setOcrText("");
    setMessage("");
    try {
      const result = await extractTextWithGemini(imageDataUrl);

      if (result && result !== "EMPTY" && result.length > 2) {
        // Clean up: remove any markdown artifacts Gemini might add
        const cleaned = result
          .replace(/```[a-z]*\n?/g, "")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        setOcrText(cleaned);
        setManualQuery(cleaned.substring(0, 100));
      } else {
        setMessage("Không tìm thấy chữ trên ảnh. Bạn có thể nhập tên sản phẩm bên dưới.");
      }
    } catch (err) {
      console.error("Gemini Vision error:", err);
      setMessage("Lỗi nhận dạng ảnh. Hãy nhập tên sản phẩm thủ công.");
    } finally {
      setOcrLoading(false);
    }
  };

  /* ── camera helpers ── */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setMessage("");
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
    } catch {
      setMessage("Không thể mở camera.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = c.toDataURL("image/jpeg", 0.9);
      setPreview(dataUrl);
      stopCamera();
      runOCR(dataUrl);
    }
  };

  /* ── file helpers ── */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setMessage("Vui lòng chọn file hình ảnh.");
      return;
    }
    setMessage("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      runOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  /* ── actions ── */
  const handleSearch = () => {
    const q = manualQuery.trim();
    if (!q) return;
    closeModal();
    onDetected?.(q);
  };

  const reset = () => {
    setPreview(null);
    setMessage("");
    setOcrText("");
    setOcrLoading(false);
    setManualQuery("");
  };

  const closeModal = () => {
    stopCamera();
    setOpen(false);
    setPreview(null);
    setMessage("");
    setOcrText("");
    setOcrLoading(false);
    setManualQuery("");
    setDragOver(false);
  };

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    reset();
    if (m === "camera") startCamera();
    else stopCamera();
  };

  /* ── render ── */
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        aria-label="Tìm kiếm bằng hình ảnh"
        title="Tìm kiếm bằng hình ảnh"
      >
        <IconCamera />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <IconScan className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Tìm kiếm bằng hình ảnh
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  aria-label="Đóng"
                >
                  <IconClose />
                </button>
              </div>

              {/* tab switcher */}
              <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {[
                  { key: "upload", Icon: IconUpload, text: "Tải ảnh lên" },
                  { key: "camera", Icon: IconCamera, text: "Chụp ảnh" },
                ].map(({ key, Icon, text }) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                      mode === key
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {text}
                  </button>
                ))}
              </div>

              {/* content */}
              {!preview ? (
                mode === "upload" ? (
                  /* ── drag & drop zone ── */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`flex h-48 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed transition-all ${
                      dragOver
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                        : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
                      <IconImage />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Kéo thả ảnh sản phẩm vào đây
                    </p>
                    <p className="text-xs text-slate-400">hoặc bấm để chọn từ máy</p>
                    <input
                      type="file"
                      ref={fileRef}
                      accept="image/*"
                      onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
                      hidden
                    />
                  </div>
                ) : (
                  /* ── camera view ── */
                  <div className="relative overflow-hidden rounded-xl">
                    <video ref={videoRef} className="h-56 w-full bg-black object-cover" muted playsInline />
                    <button
                      onClick={captureFrame}
                      className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-5 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white active:scale-95"
                    >
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      Chụp
                    </button>
                  </div>
                )
              ) : (
                /* ── preview + OCR result ── */
                <div>
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt="Ảnh sản phẩm"
                      className="max-h-44 w-full rounded-xl bg-slate-50 object-contain dark:bg-slate-800"
                    />
                    <button
                      onClick={reset}
                      className="absolute right-2 top-2 rounded-lg bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      Chọn lại
                    </button>
                  </div>

                  {/* OCR loading */}
                  {ocrLoading && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950/30">
                      <svg className="h-4 w-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        Đang nhận dạng bằng AI...
                      </span>
                    </div>
                  )}

                  {/* OCR result text */}
                  {ocrText && !ocrLoading && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        AI nhận dạng được
                      </p>
                      <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                        {ocrText.length > 120 ? ocrText.substring(0, 120) + "…" : ocrText}
                      </p>
                    </div>
                  )}

                  {/* search input + button */}
                  {!ocrLoading && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={manualQuery}
                        onChange={(e) => setManualQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        placeholder="Nhập hoặc sửa tên sản phẩm..."
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        onClick={handleSearch}
                        disabled={!manualQuery.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <IconSearch className="h-3.5 w-3.5" />
                        Tìm
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{message}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
