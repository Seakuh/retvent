import React from "react";
import "./ErrorDialog.css";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ message, onClose }) => {
  return (
    <div className="error-dialog-overlay">
      <div className="error-dialog">
        <h2>❌ Fehler</h2>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ErrorDialog;
