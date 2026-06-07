import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function VoiceSearch({ onResult }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [done, setDone] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.lang = "vi-VN";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      console.warn("Speech error:", e.error);
      if (e.error !== "aborted") setListening(false);
    };
    rec.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript((prev) => (prev + " " + finalText).trim());
      setInterim(interimText);
    };

    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, []);

  const startListening = () => {
    setTranscript("");
    setInterim("");
    setDone(false);
    try { recognitionRef.current?.start(); } catch {}
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setDone(true);
    setInterim("");
  };

  const handleOpen = () => {
    setOpen(true);
    setTranscript("");
    setInterim("");
    setDone(false);
    // Auto-start after modal renders
    setTimeout(() => {
      try { recognitionRef.current?.start(); } catch {}
    }, 300);
  };

  const handleClose = () => {
    try { recognitionRef.current?.abort(); } catch {}
    setOpen(false);
    setListening(false);
    setTranscript("");
    setInterim("");
    setDone(false);
  };

  const handleSearch = () => {
    const q = transcript.trim();
    if (!q) return;
    handleClose();
    onResult?.(q);
  };

  const handleRetry = () => {
    setTranscript("");
    setInterim("");
    setDone(false);
    try { recognitionRef.current?.start(); } catch {}
  };

  if (!supported) {
    return (
      <button type="button" disabled
        className="rounded-lg p-1.5 text-gray-300 cursor-not-allowed"
        title="Trình duyệt không hỗ trợ giọng nói"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 transition-colors"
        aria-label="Tìm kiếm bằng giọng nói"
        title="Tìm kiếm bằng giọng nói"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={handleClose}>
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Tìm kiếm bằng giọng nói
                </p>
              </div>
              <button onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mic animation area */}
            <div className="flex flex-col items-center py-4">
              {listening ? (
                <>
                  {/* Pulsing rings */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 m-auto h-20 w-20 animate-ping rounded-full bg-red-200/40 dark:bg-red-800/20" />
                    <div className="absolute inset-0 m-auto h-16 w-16 animate-pulse rounded-full bg-red-100/60 dark:bg-red-900/30" />
                    <button onClick={stopListening}
                      className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Đang nghe...</p>
                  <p className="mt-1 text-xs text-slate-400">Bấm nút vuông để dừng</p>
                </>
              ) : !done ? (
                <>
                  <button onClick={startListening}
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95 dark:bg-slate-800 dark:hover:bg-red-950/30"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Bấm để bắt đầu nói</p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Đã ghi nhận</p>
                </>
              )}
            </div>

            {/* Live transcript */}
            {(transcript || interim) && (
              <div className="mb-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nội dung ghi nhận
                </p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {transcript}
                  {interim && <span className="text-slate-400 italic"> {interim}</span>}
                </p>
              </div>
            )}

            {/* Editable input + actions (show after done or has transcript) */}
            {done && (
              <div className="space-y-3">
                <input
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Chỉnh sửa nội dung tìm kiếm..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleRetry}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Nói lại
                  </button>
                  <button onClick={handleSearch} disabled={!transcript.trim()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 transition-all hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm kiếm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
