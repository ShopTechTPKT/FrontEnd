import { useEffect, useState, useRef, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import {
  getLuckyWheelPrizes,
  spinLuckyWheel,
  getSpinHistory,
  getSpinInfo,
} from "../../apis/luckyWheelApi";
import notify from "../../utils/notify";
import WheelCanvas from "./components/WheelCanvas";
import Pointer from "./components/Pointer";
import ResultModal from "./components/ResultModal";
import SpinHistory from "./components/SpinHistory";
import SpinInfo from "./components/SpinInfo";
import useWheelAnimation from "./hooks/useWheelAnimation";
import { playWhoosh } from "./utils/sounds";
import "./LuckyWheel.css";

export default function LuckyWheel() {
  const { user } = useContext(UserContext);
  const [prizes, setPrizes] = useState([]);
  const [history, setHistory] = useState([]);
  const [info, setInfo] = useState(null);
  
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);

  const { spinning, rotation, startSpin } = useWheelAnimation();
  const confettiCanvasRef = useRef(null);
  const confettiAnimationRef = useRef(null);

  const userId = user?.id || user?.userId || user?.customerId || null;

  // 1. Initial Loading
  const loadData = async () => {
    try {
      const prizesList = await getLuckyWheelPrizes();
      setPrizes(prizesList);

      if (userId) {
        const [historyList, spinInfo] = await Promise.all([
          getSpinHistory(userId),
          getSpinInfo(userId),
        ]);
        setHistory(historyList);
        setInfo(spinInfo);
      }
    } catch (e) {
      console.error("Failed to load lucky wheel data", e);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (confettiAnimationRef.current) {
        cancelAnimationFrame(confettiAnimationRef.current);
      }
    };
  }, [userId]);

  // 2. Confetti Particle Logic
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#ec4899", "#f97316"];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
      });
    }

    const startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Wrap around bottom
        if (p.y > canvas.height) {
          particles[idx] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
          };
        }
      });

      // Stop confetti after 4 seconds
      if (Date.now() - startTime < 4000) {
        confettiAnimationRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();
  };

  // 3. Spin Event Handler
  const handleSpin = async (usePoints = false) => {
    if (!userId) {
      notify.error("Vui lòng đăng nhập để thực hiện quay thưởng!");
      return;
    }

    if (spinning) return;

    try {
      playWhoosh();
      const res = await spinLuckyWheel({ userId, usePoints });
      
      // Extract properties
      const { prizeIndex, totalSegments, prize } = res;

      startSpin(prizeIndex, totalSegments, () => {
        // Spin finished callback
        setWonPrize(prize);
        setShowResult(true);

        const isBigWin = prize.code.includes("20") || prize.code.includes("50") || prize.code === "PHYSICAL";
        if (isBigWin) {
          triggerConfetti();
        }

        // Refresh stats
        getSpinHistory(userId).then(setHistory);
        getSpinInfo(userId).then(setInfo);
      });

    } catch (error) {
      notify.error(error?.response?.data?.message || "Không thể thực hiện quay lúc này!");
    }
  };

  const freeSpinsLeft = info ? Math.max(0, info.maxFreeSpinsPerDay - info.freeSpinsUsedToday) : 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] py-12 text-slate-100">
      <canvas ref={confettiCanvasRef} className="confetti-canvas" />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(234,179,8,0.2)]">
            VÒNG QUAY MAY MẮN
          </h1>
          <p className="mt-2 text-indigo-200/60 max-w-md mx-auto text-sm">
            Thử vận may mỗi ngày để trúng hàng ngàn Voucher giảm giá khủng và các phần quà giá trị!
          </p>
        </div>

        {/* Main Grid Wrapper */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column: Wheel Display */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="luckywheel-card p-8 rounded-3xl w-full flex flex-col items-center">
              <div className="relative wheel-glow-container mt-6">
                <Pointer />
                <WheelCanvas prizes={prizes} rotation={rotation} size={380} />
              </div>

              {/* Action Buttons */}
              <div className="mt-10 w-full flex flex-col sm:flex-row gap-4 px-4 justify-center">
                {/* Free Spin Button */}
                <button
                  onClick={() => handleSpin(false)}
                  disabled={spinning || freeSpinsLeft <= 0}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {spinning ? "Đang quay..." : `Lượt Quay Miễn Phí (${freeSpinsLeft})`}
                </button>

                {/* Point Spin Button */}
                <button
                  onClick={() => handleSpin(true)}
                  disabled={spinning || (info && info.userPoints < info.pointsPerSpin)}
                  className="flex-1 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-4 font-bold text-yellow-400 shadow-md transition-all hover:bg-yellow-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Quay Bằng Điểm (-200)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Info & History */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Info Cards */}
            <SpinInfo info={info} />

            {/* Spin History */}
            <SpinHistory history={history} />
          </div>

        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        isOpen={showResult}
        prize={wonPrize}
        onClose={() => setShowResult(false)}
      />
    </div>
  );
}
