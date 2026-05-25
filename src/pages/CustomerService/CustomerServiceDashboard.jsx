import React, { useEffect, useState, useCallback, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axiosInstance from "../../custom/axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Components
import ChatSidebar from "../../components/Chat/ChatSidebar";
import ChatWindow from "../../components/Chat/ChatWindow";
import ScheduleForm from "../../components/Schedule/ScheduleForm";
import AppointmentBookingForm from "../../components/AppointmentBookingForm";
import StatusNotice from "../../components/ui/StatusNotice";
import Button from "../../components/ui/Button";
import { fetchCannedResponses } from "../../apis/chatSupportApi";

const CustomerServiceDashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const WS_URL = (() => {
    const configured = import.meta.env.VITE_WS_URL || "/ws";
    const pageProtocol = window.location.protocol;
    if (pageProtocol === "https:" && configured.startsWith("http://")) {
      return configured.replace(/^http:\/\//i, "https://");
    }
    return configured;
  })();

  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState("");
  const [cannedResponses, setCannedResponses] = useState([]);

  // Modal states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const { t } = useTranslation("translation");
  const messagesEndRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/chat/active`);
      setSessions(Array.isArray(data) ? data : []);
      setSessionLoadError("");
    } catch (err) {
      console.error("Error loading sessions:", err);
      setSessionLoadError("Khong tai duoc danh sach hoi thoai. Vui long thu lai.");
    }
  }, [API_URL]);

  // Connect websocket
  useEffect(() => {
    loadSessions();
    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect(
      {},
      () => {
        setStompClient(client);
        setConnected(true);
        client.subscribe("/topic/chat/global", async msg => {
          const body = JSON.parse(msg.body);
          if (body.type === "NEW_SESSION") {
            await loadSessions();
          }
          
          if (body.type === "NEW_MESSAGE") {
            const { sessionCode, senderType, content, fileUrl } = body;
            setSessions(prev => {
              let updated = [...prev];
              const idx = updated.findIndex(s => s.sessionCode === sessionCode);

              if (idx !== -1) {
                // Update existing session in list
                let session = { ...updated[idx] };
                session.lastMessage = content || (fileUrl ? "Da gui file" : "");
                session.lastMessageFrom = senderType;
                session.unread = senderType === "CUSTOMER";

                updated.splice(idx, 1);
                updated.unshift(session);
              } else {
                // Session not in list yet, reload all
                loadSessions();
              }

              updated = updated.sort((a, b) => {
                if (a.unread && !b.unread) return -1;
                if (!a.unread && b.unread) return 1;
                return 0;
              });

              return updated;
            });

            // If this session is active, append message
            if (selectedSession?.sessionCode === sessionCode) {
              setMessages(prev => {
                // Prevent duplicate messages
                if (prev.some(m => 
                  m.id === body.id || 
                  (m.senderType === body.senderType && 
                   m.senderName === body.senderName && 
                   ((m.content === body.content && !body.fileUrl) || (m.fileUrl === body.fileUrl)) &&
                   Math.abs(new Date(m.sentAt) - new Date(body.sentAt)) < 1000)
                )) {
                  return prev;
                }
                return [...prev, body];
              });
            }
          }
        });
      },
      error => {
        console.error("WebSocket failed:", error);
        setConnected(false);
      }
    );

    return () => {
      if (client.connected)
        client.disconnect(() => console.log("Disconnected"));
    };
  }, [WS_URL, loadSessions, selectedSession]);

  // Refresh every 15s
  useEffect(() => {
    const interval = setInterval(() => loadSessions(), 15000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  useEffect(() => {
    fetchCannedResponses()
      .then((rows) => setCannedResponses(Array.isArray(rows) ? rows : []))
      .catch(() => setCannedResponses([]));
  }, []);

  // Select session
  const handleSelectSession = async session => {
    try {
      setSelectedSession(session);
      await axiosInstance.put(`/chat/${session.id}/read`);

      setSessions(prev =>
        prev.map(s => (s.id === session.id ? { ...s, unread: false } : s))
      );

      const res = await axiosInstance.get(`/chat/${session.id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error selecting session:", err);
    }
  };

  // Send message
  const handleSend = e => {
    e.preventDefault();
    if (!input.trim() || !stompClient || !selectedSession) return;

    const msg = {
      chatId: selectedSession.id,
      senderType: "STAFF",
      senderName: t("dashboard.staff_name"), // "CSKH" or "Support"
      content: input.trim(),
    };

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));

    setSessions(prev =>
      prev.map(s => (s.id === selectedSession.id ? { ...s, unread: false } : s))
    );

    setInput("");
  };

  const applyCannedResponse = (text) => {
    setInput(text);
  };

  return (
    <div className="flex h-full bg-[var(--color-bg-muted)] rounded-xl overflow-hidden border border-[var(--color-border)] font-sans">
      <ChatSidebar
        sessions={sessions}
        selectedSession={selectedSession}
        onSelect={handleSelectSession}
      />

      <div className="flex-1 flex flex-col bg-[var(--color-bg)] overflow-hidden">
        {/* Header */}
      <div className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-text)] shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-)] to-[var(--color-primary-)] text-white shadow-sm">
                <span className="text-xl">CS</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  {t("dashboard.title")}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      connected ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  ></span>
                  {connected
                    ? t("dashboard.connected")
                    : t("dashboard.disconnected")}{" "}
                  - {sessions.length} {t("dashboard.active_sessions")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Booking form */}
              <Button
                onClick={() => setShowAppointmentForm(true)}
                variant="primary"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              >
                {t("dashboard.btn_book_appointment")}
              </Button>

              {/* Schedule form for active session */}
              <Button
                onClick={() => setShowScheduleForm(true)}
                variant="outline"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                }
              >
                {t("dashboard.btn_schedule")}
              </Button>

              {/* Product FAQ shortcut */}
              <Button
                onClick={() => navigate("/products")}
                variant="outline"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h8M8 14h5M5 20l2-3h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v13z"
                    />
                  </svg>
                }
              >
                Hoi dap san pham
              </Button>
            </div>
          </div>
        </div>

        {sessionLoadError ? (
          <div className="px-6 pt-4">
            <StatusNotice
              tone="warning"
              title="Mat ket noi du lieu"
              message={sessionLoadError}
              actionText="Thu lai"
              onAction={loadSessions}
            />
          </div>
        ) : null}

        {/* Chat Area */}
        {selectedSession ? (
          <>
            <div className="px-4 pt-3 flex gap-2 flex-wrap border-b border-[var(--color-border)]">
              {cannedResponses.slice(0, 5).map((resp) => (
                <button
                  key={resp.id}
                  onClick={() => applyCannedResponse(resp.text)}
                  className="text-xs px-2 py-1 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary-light)]"
                >
                  {resp.id}
                </button>
              ))}
            </div>
            <ChatWindow
              selectedSession={selectedSession}
              messages={messages}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              connected={connected}
              messagesEndRef={messagesEndRef}
              onOpenSchedule={() => setShowScheduleForm(true)}
              stompClient={stompClient}
              senderName={t("dashboard.staff_name")}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
            <div className="w-24 h-24 mb-6 bg-[var(--color-bg-muted)] rounded-3xl flex items-center justify-center text-5xl shadow-sm">
              CS
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              {t("dashboard.welcome_title")}
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm max-w-md">
              {t("dashboard.welcome_subtitle")}
            </p>
          </div>
        )}
      </div>

      {/* 1. Schedule form for selected session */}
      {showScheduleForm && (
        <ScheduleForm
          onClose={() => setShowScheduleForm(false)}
          defaultInfo={selectedSession}
        />
      )}

      {/* 2. Appointment booking form */}
      <AppointmentBookingForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        customerInfo={
          selectedSession
            ? {
                name: selectedSession.guestName,
                phone: selectedSession.guestPhone,
              }
            : null
        }
      />
    </div>
  );
};

export default CustomerServiceDashboard;
