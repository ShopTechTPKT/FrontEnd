import { useEffect } from "react";
import { playDing, playVictory } from "../utils/sounds";

export default function ResultModal({ isOpen, prize, onClose }) {
  useEffect(() => {
    if (isOpen && prize) {
      const isBigWin = prize.code.includes("50") || prize.code.includes("20") || prize.code === "PHYSICAL";
      if (isBigWin) {
        playVictory();
      } else {
        playDing();
      }
    }
  }, [isOpen, prize]);

  if (!isOpen || !prize) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl border border-yellow-500/30 bg-indigo-950 p-8 text-center shadow-2xl transition-all animate-scale-in">
        {/* Shiny background glow */}
        <div className="absolute -inset-10 -z-10 bg-radial-gradient from-yellow-500/20 via-transparent to-transparent blur-2xl" />

        {/* Celebrating Header */}
        <h3 className="text-2xl font-black tracking-wide text-yellow-400 uppercase animate-bounce">
          Chúc Mừng! 🎉
        </h3>
        
        {/* Animated Icon */}
        <div className="my-6 flex justify-center text-7xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
          <span>{prize.icon}</span>
        </div>

        {/* Prize Name */}
        <h4 className="text-xl font-bold text-slate-100">
          {prize.label}
        </h4>
        
        {/* Prize description */}
        <p className="mt-2 text-sm text-indigo-200/80">
          Phần thưởng đã được lưu trực tiếp vào tài khoản của bạn.
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95"
        >
          Nhận ngay 🚀
        </button>
      </div>
    </div>
  );
}
