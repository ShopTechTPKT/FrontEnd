import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axiosInstance from "../../custom/axios";
import { UserContext } from "../../context/UserContext";
import { getWsBaseUrl } from "../../utils/runtimeUrls";

function NotificationBell() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const userId = useMemo(
    () => user?.id || user?.customerID || user?.customerId || user?.userId || null,
    [user]
  );

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const [listRes, unreadRes] = await Promise.all([
        axiosInstance.get(`/notifications/user/${userId}`, { params: { page: 0, size: 5 } }),
        axiosInstance.get(`/notifications/user/${userId}/unread-count`),
      ]);

      setItems(Array.isArray(listRes.data) ? listRes.data : []);
      setUnreadCount(Number(unreadRes.data?.count || 0));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
            setItems((prev) => [payload, ...prev].slice(0, 5));
            setUnreadCount((prev) => prev + 1);
          } catch (e) {
            console.error("Invalid notification payload:", e);
          }
        });
      });
    } catch (error) {
      console.error("Notification socket error:", error);
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
  }, [userId]);

  const markRead = async (notification) => {
    if (!notification?.id) return;
    try {
      await axiosInstance.put(`/notifications/${notification.id}/read`);
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
    setItems((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, isRead: true, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg animate-fadeIn dark:border-gray-700 dark:bg-gray-900 z-[60]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Thông báo</p>
            <button
              type="button"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              onClick={() => {
                setOpen(false);
                navigate("/userProfile?tab=notifications");
              }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Không có thông báo</div>
            ) : (
              items.map((item) => {
                const isRead = item.isRead === true || item.read === true;
                return (
                  <button
                    key={item.id || `${item.createdAt}-${item.title}`}
                    type="button"
                    onClick={() => markRead(item)}
                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${
                      isRead ? "" : "bg-indigo-50/40"
                    }`}
                  >
                    <p className={`text-sm ${isRead ? "text-gray-700 dark:text-gray-200" : "font-semibold text-gray-900 dark:text-gray-100"}`}>
                      {item.title || "Thông báo"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.message}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

