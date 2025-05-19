import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ConfirmationModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null; // Don't render if `show` is false

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Action</h5>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button onClick={onConfirm} className="btn btn-danger">
              Yes, Delete
            </button>
            <button onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
