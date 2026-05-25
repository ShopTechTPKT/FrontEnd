import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { getAllReferralsForAdmin } from "../../apis/referralApi";

export default function ReferralDashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getAllReferralsForAdmin().then(setItems).catch(() => setItems([]));
  }, []);

  const successful = useMemo(
    () => items.filter((item) => (item?.status || "").toUpperCase() === "APPLIED"),
    [items],
  );

  const totalReward = useMemo(
    () => successful.reduce((sum, item) => sum + Number(item?.referrerReward || 0), 0),
    [successful],
  );

  const leaderboard = useMemo(() => {
    const map = new Map();
    successful.forEach((item) => {
      const id = item?.referrerId || 0;
      map.set(id, (map.get(id) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([referrerId, count]) => ({ referrerId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [successful]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pageIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Referral Dashboard</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Theo dõi hiệu quả chương trình giới thiệu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Tổng lượt giới thiệu</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Giới thiệu thành công</div>
          <div className="text-2xl font-bold">{successful.length}</div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Tổng thưởng</div>
          <div className="text-2xl font-bold">{totalReward.toLocaleString("vi-VN")}đ</div>
        </div>
      </div>

      <div className="admin-card p-5 rounded-[var(--radius-lg)]">
        <h3 className="text-sm font-semibold mb-3">Top 10 người giới thiệu</h3>
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Chưa có dữ liệu.</p>
          ) : (
            leaderboard.map((item, idx) => (
              <div key={item.referrerId} className="flex items-center justify-between text-sm">
                <span>#{idx + 1} - User {item.referrerId}</span>
                <span className="font-semibold">{item.count} lượt</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

