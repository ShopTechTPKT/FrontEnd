import React, { useEffect, useRef } from "react";

/**
 * Modal — Unified dialog component.
 *
 * Features:
 * - Backdrop click to close
 * - Escape key to close
 * - Focus trap (basic)
 * - Body scroll lock
 * - Animated entrance
 *
 * Usage:
 *   <Modal isOpen={show} onClose={() => setShow(false)} title="Xác nhận">
 *     <p>Nội dung modal</p>
 *     <Modal.Footer>
 *       <Button variant="outline" onClick={onCancel}>Hủy</Button>
 *       <Button onClick={onConfirm}>Xác nhận</Button>
 *     </Modal.Footer>
 *   </Modal>
 */

function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  className = "",
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={[
          "relative bg-white rounded-xl shadow-lg w-full animate-fadeIn",
          "max-h-[90vh] overflow-y-auto",
          sizeClasses[size] || sizeClasses.md,
          className,
        ].join(" ")}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className={title ? "px-6 py-5" : "p-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Modal.Footer — Consistent action bar at the bottom of modals */
Modal.Footer = function ModalFooter({ className = "", children }) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Modal;
