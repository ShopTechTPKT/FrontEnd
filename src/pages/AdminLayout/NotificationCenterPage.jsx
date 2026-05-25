import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../custom/axios";

export default function NotificationCenterPage() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);

  const parsedUserIds = useMemo(
    () => userId.split(",").map((v) => Number(v.trim())).filter((v) => Number.isFinite(v)),
    [userId],
  );

  const fetchNotifications = async () => {
    if (!parsedUserIds.length) return;
    const { data } = await axiosInstance.get("/notifications", { params: { userId: parsedUserIds[0], size: 20 } });
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const sendBroadcast = async () => {
    await axiosInstance.post("/notifications/broadcast", {
      userIds: parsedUserIds,
      title,
      message,
      type: "SYSTEM",
    });
    setTitle("");
    setMessage("");
    fetchNotifications();
  };

  return (
    <div className="space-y-6 animate-pageIn max-w-4xl">
      <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
        Notification Center
      </h2>
      <div className="admin-card rounded-[var(--radius-lg)] p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User IDs: 1,2,3"
            className="admin-input"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề thông báo"
            className="admin-input"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nội dung thông báo"
          className="admin-input w-full min-h-[7rem]"
          rows={4}
        />
        <button
          type="button"
          onClick={sendBroadcast}
          disabled={!parsedUserIds.length || !title || !message}
          className="btn-admin-primary disabled:opacity-50"
        >
          Gửi broadcast
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="admin-card p-3 rounded-[var(--radius-md)]">
            <div className="font-medium text-[var(--color-text)]">{item.title}</div>
            <div className="text-sm text-[var(--color-text-secondary)]">
              {item.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
