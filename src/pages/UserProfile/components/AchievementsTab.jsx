import { useEffect, useState } from "react";
import { checkAchievements, getUserAchievements } from "../../../apis/achievementApi";
import { Award, ShoppingBag, Cpu, Star, Zap, Trophy, ShieldAlert } from "lucide-react";

// Map names to icons and colors
const ACHIEVEMENT_META = {
  "Đơn hàng đầu tiên": { icon: ShoppingBag, color: "from-pink-500 to-rose-500", desc: "Hoàn thành đơn hàng đầu tiên của bạn" },
  "PC Builder Master": { icon: Cpu, color: "from-indigo-500 to-indigo-600", desc: "Sử dụng tính năng xây dựng cấu hình PC" },
  "Review 5 sao": { icon: Star, color: "from-amber-400 to-orange-500", desc: "Đánh giá chất lượng sản phẩm 5 sao" },
  "Streak 30 ngày": { icon: Zap, color: "from-yellow-400 to-amber-500", desc: "Điểm danh liên tục trong vòng 30 ngày" },
  "Top Spender": { icon: Trophy, color: "from-emerald-500 to-teal-600", desc: "Đạt mốc chi tiêu cao hàng đầu tháng" },
  "default": { icon: Award, color: "from-blue-500 to-indigo-500", desc: "Nhiệm vụ đặc biệt từ Shop PC" },
};

export default function AchievementsTab({ userId }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        await checkAchievements(userId);
        const rows = await getUserAchievements(userId);
        if (mounted) setAchievements(rows);
      } catch (error) {
        console.error("Failed to load achievements:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-sm text-gray-500">Đang tải danh sách thành tích của bạn...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
      <div className="mb-6 border-b border-gray-50 pb-4 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Award className="h-5.5 w-5.5 text-indigo-600 animate-bounce" />
          <span>Hệ thống Thành tích & Huy hiệu</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Hoàn thành các nhiệm vụ mua sắm và tương tác để mở khóa huy hiệu độc quyền và nhận thêm điểm tích lũy!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map((item) => {
          const meta = ACHIEVEMENT_META[item.name] || ACHIEVEMENT_META["default"];
          const IconComponent = meta.icon;
          const progressPct = item.target > 0 ? Math.round((item.progress / item.target) * 100) : 0;

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl border p-4 transition-all duration-300 ${
                item.unlocked
                  ? "border-indigo-100 bg-indigo-50/20 hover:shadow-md dark:border-indigo-950/20 dark:bg-indigo-950/5"
                  : "border-gray-100 bg-gray-50/50 grayscale dark:border-gray-800 dark:bg-gray-950/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Left: Badge Visual */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm text-white ${meta.color}`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {item.name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        item.unlocked
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-gray-150 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {item.unlocked ? "Đã mở" : "Chưa mở"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{meta.desc}</p>

                  {/* Progress & Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span>Tiến độ: {item.progress}/{item.target}</span>
                      <span className="font-bold">{Math.min(100, progressPct)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.unlocked ? "bg-gradient-to-r from-indigo-500 to-indigo-600" : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {achievements.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
            <ShieldAlert className="mx-auto h-8 w-8 text-gray-405" />
            <p className="mt-2 text-xs text-gray-400">Hiện tại chưa có thử thách hay thành tích nào khả dụng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
