import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchAuditLogs } from "../../apis/auditLogApi";

/**
 * ActivityTimeline — Admin activity log timeline with color-coded actions.
 * Reads from /api/audit-logs endpoint.
 */

const ACTION_COLORS = {
  CREATE: "bg-green-500",
  UPDATE: "bg-[var(--color-primary-)]",
  DELETE: "bg-red-500",
  LOGIN: "bg-[var(--color-primary-)]",
  DEFAULT: "bg-gray-400",
};

export default function ActivityTimeline() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("ALL");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAuditLogs({ size: 30 })
      .then(res => {
        if (res && res.content) {
          setActivities(res.content);
        } else if (Array.isArray(res)) {
          setActivities(res);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL"
    ? activities
    : activities.filter((a) => a.action === filter);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    return d.toLocaleDateString("vi-VN");
  };

  const formatDescription = (activity) => {
    if (activity.reason) return activity.reason;
    if (activity.action && activity.resourceType) {
      return `${activity.action} ${activity.resourceType} #${activity.resourceId || ''}`;
    }
    return "Unknown action";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          {t("admin.activity_log") || "Nhật ký hoạt động"}
        </h3>
        <div className="flex gap-1">
          {["ALL", "CREATE", "UPDATE", "DELETE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--color-primary-)] text-[var(--color-primary-)]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f === "ALL" ? "Tất cả" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-0 overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">Không có hoạt động nào</div>
        ) : (
          filtered.map((activity, idx) => (
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
                <p className="text-sm text-gray-800">{formatDescription(activity)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-medium">{activity.actorEmail || activity.actorUserId || 'System'}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatTime(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
