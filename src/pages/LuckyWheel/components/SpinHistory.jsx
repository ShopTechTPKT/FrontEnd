export default function SpinHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-8 text-center">
        <span className="text-3xl opacity-40">⏳</span>
        <p className="mt-2 text-sm text-indigo-200/50">Chưa có lịch sử quay thưởng nào.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 overflow-hidden backdrop-blur-sm">
      <div className="border-b border-indigo-900/40 px-6 py-4">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <span>📜</span> Lịch sử quay gần đây
        </h3>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-indigo-900/30 bg-indigo-950/40 text-xs font-semibold text-indigo-300 uppercase">
              <th className="px-6 py-3">Phần thưởng</th>
              <th className="px-6 py-3">Hình thức</th>
              <th className="px-6 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-950/60 text-sm text-slate-300">
            {history.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-indigo-950/30 transition-colors"
              >
                <td className="px-6 py-3.5 font-medium flex items-center gap-2">
                  <span>🎁</span> {item.prizeLabel}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.usedPoints
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {item.usedPoints ? "Dùng Điểm" : "Miễn Phí"}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-xs text-indigo-200/50">
                  {new Date(item.spunAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
