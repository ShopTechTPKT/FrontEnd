import { useEffect, useRef, useState } from "react";

export default function BarcodeScanner({ onDetected }) {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setSupported(false);
    }
  }, []);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startScan = async () => {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if ("BarcodeDetector" in window) {
        const detector = new window.BarcodeDetector({
          formats: ["qr_code", "ean_13", "code_128", "upc_a"],
        });
        const tick = async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              const val = String(codes[0].rawValue);
              stopCamera();
              setOpen(false);
              onDetected?.(val);
              return;
            }
          } catch {}
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch {
      setMessage("Không thể mở camera. Bạn có thể nhập mã thủ công bên dưới.");
    }
  };

  useEffect(() => {
    if (open) startScan();
    return () => stopCamera();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        aria-label="Quét mã QR hoặc barcode"
        title="Quét mã QR hoặc barcode"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V5a1 1 0 011-1h2m12 3V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2m12-3v2a1 1 0 01-1 1h-2M7 12h10" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Quét mã QR / Barcode</p>
              <button onClick={() => { stopCamera(); setOpen(false); }} className="rounded p-1 text-gray-500 hover:bg-gray-100">Đóng</button>
            </div>
            {supported ? (
              <video ref={videoRef} className="h-56 w-full rounded-lg bg-black object-cover" muted playsInline />
            ) : (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                Trình duyệt chưa hỗ trợ quét tự động. Vui lòng nhập mã thủ công.
              </p>
            )}
            {message && <p className="mt-2 text-xs text-red-600">{message}</p>}
            <div className="mt-3 flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Nhập mã sản phẩm / QR"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  if (!manualCode.trim()) return;
                  stopCamera();
                  setOpen(false);
                  onDetected?.(manualCode.trim());
                }}
              >
                Tìm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
