import React, { useEffect } from "react";

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirmVariant = "danger",
  loading = false,
  className = "",
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) onCancel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={`modal d-block ${className}`} role="dialog" aria-modal="true">
      <div className="modal-backdrop show" onClick={loading ? undefined : onCancel} />
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="close"
              aria-label="Cerrar"
              onClick={onCancel}
              disabled={loading}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{description}</p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              className={`btn btn-${confirmVariant}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Eliminando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
