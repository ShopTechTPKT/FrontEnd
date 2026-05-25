import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../custom/axios";

const formatDateTime = (value) => {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "--";
  }
};

const toDisplayMinutes = (value) => {
  const minutes = Number(value || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return "--";
  return `${minutes.toFixed(1)} phut`;
};

const CSDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeSessions: 0,
    todayResolved: 0,
    avgResponseTime: "--",
    todayAppointments: 0,
    totalChatSessions: 0,
    closedChats: 0,
  });
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [chatsRes, appointmentsRes] = await Promise.allSettled([
          axiosInstance.get("/statistics/chats"),
          axiosInstance.get("/statistics/appointments"),
        ]);

        const chatsData =
          chatsRes.status === "fulfilled" && chatsRes.value?.data
            ? chatsRes.value.data
            : {};
        const appointmentsData =
          appointmentsRes.status === "fulfilled" && appointmentsRes.value?.data
            ? appointmentsRes.value.data
            : {};

        setStats({
          activeSessions: Number(chatsData.activeChats || 0),
          todayResolved: Number(chatsData.todayResolved || 0),
          avgResponseTime: toDisplayMinutes(chatsData.avgResponseTimeMinutes),
          todayAppointments: Number(appointmentsData.todayAppointments || 0),
          totalChatSessions: Number(chatsData.totalChatSessions || 0),
          closedChats: Number(chatsData.closedChats || 0),
        });
        setRecentChats(Array.isArray(chatsData.recentChats) ? chatsData.recentChats : []);
      } catch {
        setStats((prev) => ({
          ...prev,
          activeSessions: 0,
          todayResolved: 0,
          avgResponseTime: "--",
          todayAppointments: 0,
          totalChatSessions: 0,
          closedChats: 0,
        }));
        setRecentChats([]);
      }
    };

    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, []);

  const resolutionRate = useMemo(() => {
    if (!stats.totalChatSessions) return 0;
    return (stats.closedChats / stats.totalChatSessions) * 100;
  }, [stats.closedChats, stats.totalChatSessions]);

  const kpis = [
    {
      label: "Chat dang xu ly",
      value: stats.activeSessions,
      icon: "CHAT",
      gradient: "from-[var(--color-primary-)] to-purple-600",
    },
    {
      label: "Da giai quyet hom nay",
      value: stats.todayResolved,
      icon: "DONE",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Thoi gian phan hoi TB",
      value: stats.avgResponseTime,
      icon: "TIME",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Lich hen hom nay",
      value: stats.todayAppointments,
      icon: "CAL",
      gradient: "from-[var(--color-primary-)] to-cyan-500",
    },
  ];

  const quickActions = [
    {
      label: "Nhan chat moi",
      icon: "CHAT",
      onClick: () => navigate("/cs"),
      color: "bg-[var(--color-primary-)] text-[var(--color-primary-)]",
    },
    {
      label: "Xem lich hen",
      icon: "CAL",
      onClick: () => navigate("/cs/appointments"),
      color: "bg-[var(--color-primary-)] text-[var(--color-primary-)]",
    },
    {
      label: "Tra cuu san pham",
      icon: "LOOK",
      onClick: () => navigate("/products"),
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "FAQ",
      icon: "HELP",
      onClick: () => navigate("/faq"),
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pageIn">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary-)] to-purple-700 text-white p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-1">Tong quan ho tro khach hang</h1>
          <p className="text-[var(--color-primary-)] text-sm">
            Hien co <strong className="text-white">{stats.activeSessions}</strong> cuoc chat dang cho phan hoi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className={`kpi-card-icon bg-gradient-to-br ${kpi.gradient} text-white text-xs font-semibold`}>
              {kpi.icon}
            </div>
            <p className="kpi-card-value">{kpi.value}</p>
            <p className="kpi-card-label">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--color-text)] mb-3">Hanh dong nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-)] hover:shadow-sm transition-all group"
            >
              <span
                className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-[10px] font-semibold group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text)]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Chat gan day</h2>
          {recentChats.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Chua co du lieu chat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="px-2 py-2">Session</th>
                    <th className="px-2 py-2">Trang thai</th>
                    <th className="px-2 py-2">Bat dau</th>
                    <th className="px-2 py-2">Ket thuc</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChats.map((chat) => (
                    <tr key={chat.sessionId} className="border-b border-[var(--color-border)]/60">
                      <td className="px-2 py-2 text-[var(--color-text)]">#{chat.sessionId}</td>
                      <td className="px-2 py-2 text-[var(--color-text)]">{chat.status || "--"}</td>
                      <td className="px-2 py-2 text-[var(--color-text)]">{formatDateTime(chat.startTime)}</td>
                      <td className="px-2 py-2 text-[var(--color-text)]">{formatDateTime(chat.endTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Danh gia hieu suat</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Tong phien chat</span>
              <span className="font-semibold text-[var(--color-text)]">{stats.totalChatSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Da dong</span>
              <span className="font-semibold text-[var(--color-text)]">{stats.closedChats}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Ty le xu ly</span>
              <span className="font-semibold text-[var(--color-text)]">{resolutionRate.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t border-[var(--color-border)]">
              <div className="h-2 rounded-full bg-[var(--color-bg-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${Math.min(100, Math.max(0, resolutionRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSDashboard;

