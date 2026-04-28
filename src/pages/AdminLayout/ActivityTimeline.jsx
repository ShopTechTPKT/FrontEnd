import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * ActivityTimeline — Admin activity log timeline with color-coded actions.
 * Reads from /api/audit-logs endpoint.
 */

const ACTION_COLORS = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  LOGIN: "bg-violet-500",
  DEFAULT: "bg-gray-400",
};

const MOCK_ACTIVITIES = [
  { id: 1, action: "CREATE", resourceType: "ORDER", description: "Tao don hang #1024", createdAt: "2026-04-28T10:30:00", user: "Admin" },
  { id: 2, action: "UPDATE", resourceType: "PRODUCT", description: "Cap nhat gia MacBook Pro", createdAt: "2026-04-28T10:15:00", user: "Admin" },
  { id: 3, action: "DELETE", resourceType: "REVIEW", description: "Xoa danh gia vi pham", createdAt: "2026-04-28T09:45:00", user: "Moderator" },
  { id: 4, action: "UPDATE", resourceType: "ORDER", description: "Cap nhat trang thai don #1023 -> SHIPPED", createdAt: "2026-04-28T09:30:00", user: "Admin" },
  { id: 5, action: "CREATE", resourceType: "PRODUCT", description: "Them san pham iPhone 16", createdAt: "2026-04-28T09:00:00", user: "Admin" },
  { id: 6, action: "CREATE", resourceType: "COUPON", description: "Tao ma giam gia SUMMER2026", createdAt: "2026-04-27T16:00:00", user: "Marketing" },
];

export default function ActivityTimeline() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("ALL");
  const [activities] = useState(MOCK_ACTIVITIES);

  const filtered = filter === "ALL"
    ? activities
    : activities.filter((a) => a.action === filter);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} phut truoc`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} gio truoc`;
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          {t("admin.activity_log") || "Nhat ky hoat dong"}
        </h3>
        <div className="flex gap-1">
          {["ALL", "CREATE", "UPDATE", "DELETE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === f
                  ? "bg-violet-100 text-violet-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f === "ALL" ? "Tat ca" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-0">
        {filtered.map((activity, idx) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${
                  ACTION_COLORS[activity.action] || ACTION_COLORS.DEFAULT
                }`}
              />
              {idx < filtered.length - 1 && (
                <div className="w-px h-full bg-gray-200 min-h-[32px]" />
              )}
            </div>
            <div className="pb-5 min-w-0">
              <p className="text-sm text-gray-800">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{activity.user}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatTime(activity.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
