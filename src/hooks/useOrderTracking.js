import { useEffect, useMemo, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import notify from "../utils/notify";

const getWsBase = () => {
  const configuredBase = import.meta.env.VITE_HOST_API_BACKEND_SERVICE || "/api";
  const base = configuredBase.replace(/\/$/, "");
  return `${base}/ws`;
};

export const useOrderTracking = (orderId) => {
  const [latestEvent, setLatestEvent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let stompClient = null;
    let socket = null;

    const socketUrl = getWsBase();
    socket = new SockJS(socketUrl);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        setConnected(true);
        stompClient.subscribe(`/topic/order/${orderId}/status`, (message) => {
          if (!message?.body) return;
          try {
            const parsed = JSON.parse(message.body);
            const event = {
              orderId: parsed.orderId,
              status: parsed.newStatus || parsed.status,
              updatedAt: parsed.updatedAt || new Date().toISOString(),
              message: parsed.message || "",
            };
            setLatestEvent(event);
            setTimeline((prev) => [...prev, event]);
            notify.info(`Đơn hàng cập nhật: ${event.status}`);
          } catch (error) {
            console.error("Failed to parse order tracking event:", error);
          }
        });
      },
      () => {
        setConnected(false);
      }
    );

    return () => {
      setConnected(false);
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {});
      } else if (socket) {
        try {
          socket.close();
        } catch {
          // ignore close errors
        }
      }
    };
  }, [orderId]);

  const hasRecentUpdate = useMemo(() => {
    if (!latestEvent?.updatedAt) return false;
    const updated = new Date(latestEvent.updatedAt).getTime();
    if (Number.isNaN(updated)) return false;
    return Date.now() - updated < 60 * 1000;
  }, [latestEvent]);

  return {
    latestEvent,
    timeline,
    connected,
    hasRecentUpdate,
  };
};

export default useOrderTracking;
