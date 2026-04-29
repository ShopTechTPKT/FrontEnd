import { createContext, useContext, useState, useMemo, useEffect } from "react";
import Toast from "./Toast";
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000, position = "top-right") => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, position };

    setToasts((prevToasts) => {
      const samePosition = prevToasts.filter((item) => item.position === position);
      const overflowCount = Math.max(0, samePosition.length + 1 - 3);
      if (!overflowCount) return [...prevToasts, newToast];

      const idsToDrop = samePosition.slice(0, overflowCount).map((item) => item.id);
      return [...prevToasts.filter((item) => !idsToDrop.includes(item.id)), newToast];
    });

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, duration = 3000, position = "top-right") => {
    return addToast(message, "success", duration, position);
  };

  const showError = (message, duration = 3000, position = "top-right") => {
    return addToast(message, "error", duration, position);
  };

  const showWarning = (message, duration = 3000, position = "top-right") => {
    return addToast(message, "warning", duration, position);
  };

  const showInfo = (message, duration = 3000, position = "top-right") => {
    return addToast(message, "info", duration, position);
  };

  // Global event bridge so non-react files or non-hook places can trigger notifications
  useEffect(() => {
    const handler = (e) => {
      const { type = "info", message = "", duration = 3000, position = "top-right" } = e.detail || {};
      addToast(message, type, duration, position);
    };
    window.addEventListener("app:notify", handler);
    return () => window.removeEventListener("app:notify", handler);
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, opts = {}) => addToast(message, "success", opts.duration ?? 3000, opts.position ?? "top-right"),
      error: (message, opts = {}) => addToast(message, "error", opts.duration ?? 3000, opts.position ?? "top-right"),
      warning: (message, opts = {}) => addToast(message, "warning", opts.duration ?? 3000, opts.position ?? "top-right"),
      info: (message, opts = {}) => addToast(message, "info", opts.duration ?? 3000, opts.position ?? "top-right"),
    }),
    []
  );

  return (
    <ToastContext.Provider
      value={{
        addToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toast,
      }}
    >
      {children}
      
      {/* Render Toasts by Position */}
      <div className="fixed top-0 right-0 pointer-events-none z-[9999]">
        <div className="flex flex-col gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "top-right")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>

      <div className="fixed top-0 left-0 pointer-events-none z-[9999]">
        <div className="flex flex-col gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "top-left")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>

      <div className="fixed bottom-0 right-0 pointer-events-none z-[9999]">
        <div className="flex flex-col-reverse gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "bottom-right")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 pointer-events-none z-[9999]">
        <div className="flex flex-col-reverse gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "bottom-left")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-[9999]">
        <div className="flex flex-col gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "top-center")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-[9999]">
        <div className="flex flex-col-reverse gap-3 p-4 pointer-events-auto">
          {toasts
            .filter((toast) => toast.position === "bottom-center")
            .map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={removeToast}
              />
            ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
