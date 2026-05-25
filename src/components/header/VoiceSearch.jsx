import { useEffect, useRef, useState } from "react";

export default function VoiceSearch({ onResult }) {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (transcript && onResult) onResult(transcript);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  if (!supported) {
    return (
      <button
        type="button"
        className="rounded-lg p-1.5 text-gray-300"
        title="Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói"
        aria-label="Trình duyệt chưa hỗ trợ tìm kiếm bằng giọng nói"
        disabled
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (!recognitionRef.current || listening) return;
        recognitionRef.current.start();
      }}
      className={`rounded-lg p-1.5 ${listening ? "bg-red-50 text-red-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"}`}
      aria-label={listening ? "Đang nghe giọng nói" : "Tìm kiếm bằng giọng nói"}
      title={listening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"}
    >
      <svg className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
}
