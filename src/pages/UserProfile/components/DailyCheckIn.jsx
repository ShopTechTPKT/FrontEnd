import { useEffect, useState } from "react";
import { getDailyCheckInStreak, submitDailyCheckIn } from "../../../apis/checkInApi";
import notify from "../../../utils/notify";

export default function DailyCheckIn({ userId }) {
  const [data, setData] = useState({ currentStreak: 0, calendar: [] });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    try {
      const res = await getDailyCheckInStreak(userId);
      setData(res || { currentStreak: 0, calendar: [] });
    } catch (error) {
      console.error("Load check-in streak failed:", error);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await submitDailyCheckIn(userId);
      notify.success(`Check-in thanh cong +${res?.pointsEarned || 0} diem`);
      if (res?.bonusVoucher) {
        notify.success("Ban da dat streak ngay 7 - co bonus voucher!");
      }
      await load();
    } catch (error) {
      const msg = error?.response?.data?.message || "Khong the check-in hom nay";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Daily Check-in</h3>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          Streak {data.currentStreak}/7
        </span>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, idx) => {
          const day = idx + 1;
          const checked = (data.calendar || []).some((c) => Number(c.streakCount) === day);
          return (
            <div
              key={day}
              className={`rounded-lg border p-2 text-center text-xs ${checked ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}
            >
              Ngay {day}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={loading}
        className="btn-primary disabled:opacity-60"
      >
        {loading ? "Dang check-in..." : "Check-in hom nay"}
      </button>
    </div>
  );
}
