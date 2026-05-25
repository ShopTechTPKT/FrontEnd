import React, { useEffect, useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import axiosInstance from "../../custom/axios";
import AdminEmptyStateCard from "./components/AdminEmptyStateCard";

export default function OrderKanbanPage() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchKanban = async () => {
      try {
        const { data } = await axiosInstance.get("/orders/kanban");
        if (mounted) setColumns(data || {});
      } catch {
        if (mounted) setColumns({});
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchKanban();
    return () => {
      mounted = false;
    };
  }, []);

  const entries = useMemo(() => Object.entries(columns || {}), [columns]);
  const totalCards = useMemo(
    () =>
      entries.reduce(
        (acc, [, items]) =>
          acc + (Array.isArray(items) ? items.length : 0),
        0
      ),
    [entries]
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pageIn">
        <div className="admin-skeleton h-9 w-52 rounded-lg border border-[var(--color-border)]" />
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div
              key={k}
              className="admin-skeleton h-72 rounded-[var(--radius-lg)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0 || totalCards === 0) {
    return (
      <div className="py-6 animate-pageIn">
        <AdminEmptyStateCard
          icon={<LayoutGrid className="w-7 h-7" strokeWidth={1.5} />}
          title="Chưa có đơn trên Kanban"
          description="Dữ liệu Kanban trống hoặc chưa có đơn ở các cột. Kiểm tra lại API hoặc mục Đơn hàng để xử lý đơn chờ."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pageIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Order Kanban
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {totalCards} đơn • {entries.length} cột trạng thái
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {entries.map(([status, items]) => (
          <div
            key={status}
            className="admin-card p-4 flex flex-col min-h-[280px] bg-[var(--color-bg-subtle)]/40"
          >
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-sm text-[var(--color-text)] truncate">
                {status}
              </h3>
              <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                {(items || []).length}
              </span>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {(items || []).map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-[var(--color-text)]">
                    #{order.id}
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-xs mt-1 line-clamp-3">
                    {order.deliveryAddress || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
