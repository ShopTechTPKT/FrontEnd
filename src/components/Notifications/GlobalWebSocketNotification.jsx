import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const GlobalWebSocketNotification = () => {
  useEffect(() => {
    let stompClient = null;
    let socket = null;
    let reconnectTimer = null;
    let isUnmounted = false;
    let isIntentionalClose = false;
    let retryCount = 0;

    const resolveSockJsUrl = () => {
      // WebSocket endpoint is registered at /ws on the backend (not under /api).
      // In dev, Vite proxies /ws → gateway → backend.
      // In prod, use VITE_WS_URL env var or default to same-origin /ws.
      const wsUrl = import.meta.env.VITE_WS_URL;
      if (wsUrl) return wsUrl;
      return "/ws";
    };

    const connectWebSocket = () => {
      if (isUnmounted) return;
      isIntentionalClose = false;

      const socketUrl = resolveSockJsUrl();

      socket = new SockJS(socketUrl);
      stompClient = Stomp.over(socket);

      // Disable spammy debug logs in production
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        (frame) => {
          retryCount = 0;
          
          // Subscribe to global notifications
          stompClient.subscribe('/topic/notifications', (message) => {
            if (message.body) {
              const notification = JSON.parse(message.body);
              
              const options = {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              };

              switch(notification.type) {
                case 'SUCCESS':
                  toast.success(notification.message, options);
                  break;
                case 'WARNING':
                  toast.warning(notification.message, options);
                  break;
                case 'ERROR':
                  toast.error(notification.message, options);
                  break;
                default:
                  toast.info(notification.message, options);
                  break;
              }
            }
          });
        },
        (error) => {
          // Ignore expected errors during component cleanup (React StrictMode/dev double-mount).
          if (isUnmounted || isIntentionalClose) return;

          retryCount += 1;
          // Keep logs concise to avoid noisy stack traces every reconnect cycle.
          console.warn(`⚠️ Global Notification WS reconnect #${retryCount}:`, error);
          // Auto-reconnect after 5 seconds (if component still mounted)
          if (!isUnmounted) {
            reconnectTimer = setTimeout(connectWebSocket, 5000);
          }
        }
      );
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      isIntentionalClose = true;

      // Avoid InvalidStateError when unmount happens before STOMP handshake finishes.
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
        });
      } else if (socket) {
        try {
          socket.close();
        } catch {
          // ignore close errors during rapid mount/unmount in dev strict mode
        }
      }
    };
  }, []);

  // This component doesn't render any visible UI natively, 
  // it just manages the WebSocket connection and fires Toasts.
  return null;
};

export default GlobalWebSocketNotification;
