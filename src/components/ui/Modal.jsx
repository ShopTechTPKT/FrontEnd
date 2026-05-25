import React, { useEffect, useRef } from "react";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[min(100vw-2rem,1200px)]",
};

const panelAnim = {
  fade: "animate-fadeIn",
  scale: "animate-scaleIn",
  "slide-up": "animate-slideInUp",
};

function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  animation = "fade",
  backdropBlur = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  drawer,
  drawerSide = "right",
  children,
  className = "",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const node = modalRef.current;
    if (!node) return;
    const focusables = node.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus?.();

    const trap = (e) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus?.();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus?.();
      }
    };
    node.addEventListener("keydown", trap);
    return () => node.removeEventListener("keydown", trap);
  }, [isOpen]);

  if (!isOpen) return null;

  const isDrawer = Boolean(drawer);
  const drawerPanel =
    drawerSide === "left"
      ? "left-0 top-0 h-full max-h-none w-[min(100vw-2rem,400px)] rounded-none animate-slideInLeft"
      : "right-0 top-0 h-full max-h-none w-[min(100vw-2rem,400px)] rounded-none animate-slideInRight";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className={[
          "absolute inset-0 bg-black/50 transition-opacity",
          backdropBlur ? "backdrop-blur-sm" : "",
        ].join(" ")}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={[
          "relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900",
          isDrawer
            ? `fixed ${drawerPanel}`
            : [sizeClasses[size] || sizeClasses.md, panelAnim[animation] || panelAnim.fade].join(" "),
          className,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Đóng"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className={title ? "px-6 py-5" : "p-6"}>{children}</div>
      </div>
    </div>
  );
}

Modal.Footer = function ModalFooter({ className = "", children }) {
  return (
    <div
      className={`mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
};

export default Modal;
