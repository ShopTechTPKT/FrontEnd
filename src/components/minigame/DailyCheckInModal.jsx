import React, { useEffect, useState } from "react";
import { getDailyCheckInStreak, submitDailyCheckIn } from "../../apis/checkInApi";
import notify from "../../utils/notify";
import getCurrentUserId from "../../utils/getCurrentUserId";

export default function DailyCheckInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ currentStreak: 0, calendar: [] });
  const [loading, setLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const userId = getCurrentUserId();

  useEffect(() => {
    if (!userId) return;

    // Only show once per session
    const hasSeen = sessionStorage.getItem("hasSeenCheckInModal");
    if (hasSeen) return;

    const load = async () => {
      try {
        const res = await getDailyCheckInStreak(userId);
        setData(res || { currentStreak: 0, calendar: [] });
        
        // Check if already checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const isCheckedToday = (res?.calendar || []).some(
          c => c.checkedInAt && c.checkedInAt.startsWith(todayStr)
        );
        
        setCheckedInToday(isCheckedToday);

        // Show modal if not checked in today
        if (!isCheckedToday) {
          setIsOpen(true);
          sessionStorage.setItem("hasSeenCheckInModal", "true");
        }
      } catch (error) {
        console.error("Load check-in streak failed:", error);
      }
    };
    load();
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await submitDailyCheckIn(userId);
      notify.success(`Điểm danh thành công! +${res?.pointsEarned || 0} điểm`);
      if (res?.bonusVoucher) {
        notify.success("Bạn đã đạt streak ngày 7 - Nhận được voucher thưởng!");
      }
      setCheckedInToday(true);
      
      // Update data visually
      setData(prev => ({
        ...prev,
        currentStreak: (prev.currentStreak % 7) + 1,
        calendar: [...prev.calendar, { streakCount: (prev.currentStreak % 7) + 1, checkedInAt: new Date().toISOString() }]
      }));
      
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Hôm nay bạn đã điểm danh rồi hoặc có lỗi xảy ra.";
      notify.error(msg);
      setCheckedInToday(true); // Don't show again if error
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="animate-zoomIn w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-200 rounded-full blur-3xl opacity-50"></div>

        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors z-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">Điểm danh hằng ngày</h3>
          <p className="text-sm text-gray-500 mb-6">Tích lũy điểm thưởng và nhận quà bất ngờ vào ngày 7!</p>
          
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Chuỗi điểm danh</span>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
              {data.currentStreak}/7 🔥
            </span>
          </div>

          <div className="mb-6 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, idx) => {
              const day = idx + 1;
              const checked = (data.calendar || []).some((c) => Number(c.streakCount) === day);
              const isToday = day === ((data.currentStreak % 7) + 1) && !checkedInToday;
              
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-medium transition-all ${
                    checked 
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : isToday 
                        ? "border-2 border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                  }`}
                >
                  <span className="opacity-80 text-[10px] mb-0.5">N{day}</span>
                  {checked ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : day === 7 ? (
                    <span className="text-sm">🎁</span>
                  ) : (
                    <span className="text-sm">🪙</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCheckIn}
            disabled={loading || checkedInToday}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
              checkedInToday 
                ? "bg-emerald-500 shadow-emerald-500/30" 
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:scale-105 hover:shadow-violet-600/30 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
            }`}
          >
            {checkedInToday ? "Đã điểm danh" : loading ? "Đang xử lý..." : "Điểm danh ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
