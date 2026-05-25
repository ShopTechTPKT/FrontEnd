import React, { useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";
import axiosInstance from "../../custom/axios";
import AdminEmptyStateCard from "./components/AdminEmptyStateCard";

export default function ReturnRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async ({ showSpinner = true } = {}) => {
    if (showSpinner) setLoading(true);
    try {
      const { data } = await axiosInstance.get("/returns/admin", {
        params: { status: "PENDING" },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems({ showSpinner: true });
  }, []);

  const updateStatus = async (id, status) => {
    await axiosInstance.patch(`/returns/${id}/status`, { status });
    fetchItems({ showSpinner: false });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pageIn max-w-3xl">
        <div className="admin-skeleton h-9 w-56 rounded-lg border border-[var(--color-border)]" />
        <div className="admin-skeleton h-40 rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
        <div className="admin-skeleton h-40 rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 animate-pageIn">
        <AdminEmptyStateCard
          icon={<PackageOpen className="w-7 h-7" strokeWidth={1.5} />}
          title="Không có yêu cầu hoàn trả"
          description="Khi khách gửi yêu cầu hoàn hàng ở trạng thái chờ duyệt, danh sách sẽ hiển thị tại đây."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-pageIn">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Return Requests
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {items.length} yêu cầu đang chờ xử lý
        </p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="admin-card p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)]"
          >
            <div className="font-semibold text-[var(--color-text)]">
              Request #{item.id}
            </div>
            <div className="text-sm text-[var(--color-text-secondary)] mt-1">
              Order: {item.orderId || "N/A"} — User: {item.userId || "N/A"}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus(item.id, "APPROVED")}
                className="btn-admin-primary bg-emerald-600 hover:opacity-95"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateStatus(item.id, "REJECTED")}
                className="btn-admin-outline border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
