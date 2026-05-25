import { useEffect, useMemo, useState } from "react";
import { getLuckyWheelPrizes, spinLuckyWheel } from "../../apis/luckyWheelApi";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import notify from "../../utils/notify";

export default function LuckyWheel() {
  const { user } = useContext(UserContext);
  const [prizes, setPrizes] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const userId = user?.id || user?.userId || user?.customerId || null;

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await getLuckyWheelPrizes();
        setPrizes(rows);
      } catch (e) {
        console.error("Load prizes failed", e);
      }
    };
    load();
  }, []);

  const segments = useMemo(() => (prizes.length > 0 ? prizes : []), [prizes]);

  const onSpin = async (usePoints = false) => {
    if (!userId) {
      notify.error("Vui long dang nhap de quay thuong");
      return;
    }
    setSpinning(true);
    try {
      const res = await spinLuckyWheel({ userId, usePoints });
      const prizeLabel = res?.prize?.label || "Phan thuong";
      const randomExtra = 720 + Math.floor(Math.random() * 720);
      setRotation((prev) => prev + randomExtra);
      setResult(prizeLabel);
      notify.success(`Ban nhan duoc: ${prizeLabel}`);
    } catch (error) {
      notify.error(error?.response?.data?.message || "Khong the quay luc nay");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Lucky Wheel</h1>
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="relative mx-auto h-[300px] w-[300px]">
            <div
              className="h-full w-full rounded-full border-8 border-[var(--color-primary-)] transition-transform duration-[2000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: "conic-gradient(#7c3aed 0deg, #06b6d4 80deg, #f59e0b 160deg, #ef4444 240deg, #22c55e 320deg, #7c3aed 360deg)",
              }}
            />
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-[var(--color-text)]">Danh sach giai thuong</h2>
            <ul className="mb-4 space-y-1 text-sm text-[var(--color-text-muted)]">
              {segments.map((p) => (
                <li key={p.code}>- {p.label}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" disabled={spinning} onClick={() => onSpin(false)}>
                {spinning ? "Dang quay..." : "Quay mien phi"}
              </button>
              <button className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" disabled={spinning} onClick={() => onSpin(true)}>
                Quay bang diem (200)
              </button>
            </div>
            {result && (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                Ket qua: {result}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
