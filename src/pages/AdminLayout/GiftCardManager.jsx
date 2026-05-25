import React, { useEffect, useMemo, useState } from "react";
import { Gift } from "lucide-react";
import { getAllGiftCardsForAdmin } from "../../apis/giftCardApi";

export default function GiftCardManager() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getAllGiftCardsForAdmin().then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((item) => (item?.status || "").toUpperCase() === statusFilter);
  }, [items, statusFilter]);

  const totalRevenue = useMemo(
    () => items.reduce((sum, item) => sum + Number(item?.originalAmount || 0), 0),
    [items],
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pageIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Quản lý Gift Card</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Theo dõi trạng thái và doanh thu gift card.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Tổng gift card</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Doanh thu</div>
          <div className="text-2xl font-bold">{totalRevenue.toLocaleString("vi-VN")}đ</div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Đã đổi</div>
          <div className="text-2xl font-bold">
            {items.filter((item) => item?.status === "REDEEMED").length}
          </div>
        </div>
      </div>

      <div className="admin-card p-4 rounded-[var(--radius-lg)]">
        <label className="text-sm font-medium mr-3">Lọc trạng thái</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input w-52 inline-block"
        >
          <option value="ALL">Tất cả</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="REDEEMED">REDEEMED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      <div className="admin-card rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Mã</th>
                <th className="px-4 py-3 text-left text-xs">Mệnh giá</th>
                <th className="px-4 py-3 text-left text-xs">Người gửi</th>
                <th className="px-4 py-3 text-left text-xs">Email nhận</th>
                <th className="px-4 py-3 text-left text-xs">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 text-sm font-medium">{item.code}</td>
                  <td className="px-4 py-3 text-sm">{Number(item.originalAmount || 0).toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3 text-sm">{item.senderUserId || "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.recipientEmail || "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

