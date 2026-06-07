export default function SpinInfo({ info }) {
  if (!info) return null;

  const freeSpinsLeft = Math.max(0, info.maxFreeSpinsPerDay - info.freeSpinsUsedToday);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Points Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -mr-2 -mt-2 h-16 w-16 rounded-full bg-yellow-500/10 blur-xl" />
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          Điểm Tích Lũy
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-yellow-400">
            {info.userPoints.toLocaleString()}
          </span>
          <span className="text-xs text-yellow-400/80">★</span>
        </div>
        <p className="mt-2 text-xs text-indigo-200/50">
          Mua thêm lượt quay: {info.pointsPerSpin} điểm/lượt
        </p>
      </div>

      {/* Free Spins Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -mr-2 -mt-2 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl" />
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          Lượt Quay Miễn Phí
        </span>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-black text-emerald-400">
            {freeSpinsLeft}
          </span>
          <span className="text-xs text-emerald-400/80">/ {info.maxFreeSpinsPerDay}</span>
        </div>
        <p className="mt-2 text-xs text-indigo-200/50">
          Lượt miễn phí reset vào lúc 0h mỗi ngày.
        </p>
      </div>
    </div>
  );
}
