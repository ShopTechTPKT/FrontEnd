import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useTranslation } from "react-i18next";

/**
 * ConfirmModal — Unified confirm dialog with i18n support.
 * Built on top of Modal + Button design system components.
 *
 * Usage:
 *   <ConfirmModal
 *     isOpen={show}
 *     title="Xác nhận xoá"
 *     message="Bạn có chắc muốn xoá không?"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShow(false)}
 *   />
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmVariant = "primary",
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      <Modal.Footer>
        <Button variant="outline" size="md" onClick={onCancel}>
          {cancelText ?? t("common.cancel")}
        </Button>
        <Button variant={confirmVariant} size="md" onClick={onConfirm}>
          {confirmText ?? t("common.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;