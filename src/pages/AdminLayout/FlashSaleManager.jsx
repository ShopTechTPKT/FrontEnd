import React, { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import axiosInstance from "../../custom/axios";
import AdminEmptyStateCard from "./components/AdminEmptyStateCard";

const emptyForm = {
  name: "",
  startTime: "",
  endTime: "",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

export default function FlashSaleManager() {
  const [flashSales, setFlashSales] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchFlashSales = async () => {
    const { data } = await axiosInstance.get("/flash-sales");
    setFlashSales(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const activeCount = useMemo(
    () => flashSales.filter((item) => item?.isActive).length,
    [flashSales],
  );

  const totalSold = useMemo(
    () =>
      flashSales.reduce((sum, sale) => {
        const saleItems = Array.isArray(sale?.items) ? sale.items : [];
        return (
          sum +
          saleItems.reduce((saleSum, item) => saleSum + (item?.soldCount || 0), 0)
        );
      }, 0),
    [flashSales],
  );

  const handleCreate = async () => {
    if (!form.name || !form.startTime || !form.endTime) return;
    setSubmitting(true);
    try {
      await axiosInstance.post("/flash-sales/schedule", {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: true,
      });
      setForm(emptyForm);
      await fetchFlashSales();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pageIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center">
          <Zap className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Quản lý Flash Sale
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Lên lịch chương trình giảm giá nhanh và theo dõi số lượng đã bán.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Tổng chiến dịch</div>
          <div className="text-2xl font-bold text-[var(--color-text)] mt-1">
            {flashSales.length}
          </div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Đang hoạt động</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="admin-card p-4 rounded-[var(--radius-lg)]">
          <div className="text-xs text-[var(--color-text-secondary)]">Đã bán (ước tính)</div>
          <div className="text-2xl font-bold text-[var(--color-text)] mt-1">{totalSold}</div>
        </div>
      </div>

      <div className="admin-card p-6 rounded-[var(--radius-lg)] space-y-4">
        <div className="text-sm font-semibold text-[var(--color-text)]">Tạo lịch Flash Sale</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Tên chương trình"
            className="admin-input"
          />
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="admin-input"
          />
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="admin-input"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="btn-admin-primary disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : "Tạo lịch"}
        </button>
      </div>

      {flashSales.length === 0 ? (
        <AdminEmptyStateCard
          icon={<Zap className="w-7 h-7" strokeWidth={1.5} />}
          title="Chưa có Flash Sale"
          description="Tạo lịch mới để bắt đầu chiến dịch giảm giá theo giờ."
        />
      ) : (
        <div className="admin-card rounded-[var(--radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-[var(--color-bg-subtle)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Bắt đầu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Kết thúc</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Đã bán</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)]">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {flashSales.map((sale) => {
                  const items = Array.isArray(sale?.items) ? sale.items : [];
                  const sold = items.reduce((sum, item) => sum + (item?.soldCount || 0), 0);
                  return (
                    <tr key={sale.id} className="border-t border-[var(--color-border)]">
                      <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{sale.name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDateTime(sale.startTime)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDateTime(sale.endTime)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{items.length}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{sold}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            sale?.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {sale?.isActive ? "Đang chạy" : "Tạm dừng"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
