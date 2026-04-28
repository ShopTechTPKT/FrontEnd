import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

/**
 * ConfirmModal — Backward-compatible confirm dialog.
 * Now built on top of the unified Modal component.
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      <Modal.Footer>
        <Button variant="outline" size="md" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="primary" size="md" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;