export { default as Toast } from "./Toast";
export { ToastProvider, useToast } from "./ToastProvider";

const emit = (type, message, options = {}) => {
  window.dispatchEvent(
    new CustomEvent("app:notify", {
      detail: {
        type,
        message,
        duration: options.duration ?? 3000,
        position: options.position ?? "top-right",
      },
    })
  );
};

export const toast = {
  success: (message, options) => emit("success", message, options),
  error: (message, options) => emit("error", message, options),
  warning: (message, options) => emit("warning", message, options),
  info: (message, options) => emit("info", message, options),
};
