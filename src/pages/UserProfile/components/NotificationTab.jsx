import React, { useEffect, useMemo, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axiosInstance from "../../../custom/axios";
import { getWsBaseUrl } from "../../../utils/runtimeUrls";

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "ORDER", label: "Đơn hàng" },
  { key: "PROMOTION", label: "Khuyến mãi" },
  { key: "SYSTEM", label: "Hệ thống" },
];

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  } catch {
    // ignore
  }
};

const NotificationTab = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationSoundEnabled");
    return saved == null ? true : saved === "true";
  });

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/notifications/user/${userId}`, {
        params: { page: 0, size: 50 },
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    let socket = null;
    let client = null;

    try {
      socket = new SockJS(getWsBaseUrl());
      client = Stomp.over(socket);
      client.debug = () => {};
      client.connect({}, () => {
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          if (!message?.body) return;
          try {
            const payload = JSON.parse(message.body);
            const normalized = {
              ...payload,
              isRead: payload?.isRead ?? payload?.read ?? false,
              type: String(payload?.type || "SYSTEM").toUpperCase(),
            };
            setNotifications((prev) => [normalized, ...prev]);
            if (soundEnabled) {
              playNotificationSound();
            }
          } catch (e) {
            console.error("Invalid notification payload:", e);
          }
        });
      });
    } catch (error) {
      console.error("Notification WS error:", error);
    }

    return () => {
      if (client && client.connected) {
        client.disconnect(() => {});
      } else if (socket) {
        try {
          socket.close();
        } catch {
          // ignore
        }
      }
    };
  }, [userId, soundEnabled]);

  useEffect(() => {
    localStorage.setItem("notificationSoundEnabled", String(soundEnabled));
  }, [soundEnabled]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed markAsRead:", error);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    );
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.put(`/notifications/user/${userId}/read-all`);
    } catch (error) {
      console.error("Failed markAllRead:", error);
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );
  };

  const removeNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Failed remove notification:", error);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const removeAll = async () => {
    try {
      await axiosInstance.delete(`/notifications/user/${userId}/all`);
      setNotifications([]);
    } catch (error) {
      console.error("Failed remove all notifications:", error);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => String(n.type || "").toUpperCase() === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !(n.isRead === true || n.read === true)).length;

  const getIcon = (type) => {
    const normalized = String(type || "").toUpperCase();
    if (normalized === "ORDER") return "📦";
    if (normalized === "PROMOTION") return "🏷️";
    if (normalized === "SYSTEM") return "⚙️";
    return "🔔";
  };

  const getTimeSince = (date) => {
    if (!date) return "Vừa xong";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="profile-card p-8 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="profile-card animate-fadeInUp">
      <div className="profile-card-header">
        <div className="flex items-center gap-3">
          <h2 className="profile-card-title">Thông báo</h2>
          {unreadCount > 0 && <span className="profile-nav-badge">{unreadCount}</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-violet-600"
            />
            Âm báo
          </label>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
            >
              Đánh dấu đã đọc
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={removeAll}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs mb-0">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`profile-tab ${filter === f.key ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center text-3xl">🔕</div>
          <p className="text-sm text-[var(--color-text-muted)]">Không có thông báo</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]">
          {filtered.map((n) => {
            const isRead = n.isRead === true || n.read === true;
            return (
              <div
                key={n.id || `${n.createdAt}-${n.title}`}
                className={`w-full flex items-start gap-3 p-4 transition-colors hover:bg-[var(--color-bg-subtle)] ${
                  !isRead ? "bg-[var(--color-primary-subtle)]/50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => !isRead && n.id && markAsRead(n.id)}
                  className="text-xl flex-shrink-0 mt-0.5"
                >
                  {getIcon(n.type)}
                </button>
                <button
                  type="button"
                  onClick={() => !isRead && n.id && markAsRead(n.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm truncate ${!isRead ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}>
                      {n.title}
                    </p>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{getTimeSince(n.createdAt)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => n.id && removeNotification(n.id)}
                  className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationTab;
