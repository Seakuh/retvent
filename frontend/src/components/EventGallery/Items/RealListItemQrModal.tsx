import { QRCodeCanvas } from "qrcode.react";
import "./RealListItemQrModal.css";

interface RealListItemQrModalProps {
  eventId: string;
  onClose: () => void;
}

export const RealListItemQrModal: React.FC<RealListItemQrModalProps> = ({
  eventId,
  onClose,
}) => {
  const qrUrl = `https://event-scanner.com/event/${eventId}`;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="real-list-item-qr-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="real-list-item-qr-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="real-list-item-qr-modal-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          ×
        </button>
        <div className="real-list-item-qr-modal-header">
          <h2>QR-Code für Event</h2>
          <p className="real-list-item-qr-modal-url">{qrUrl}</p>
        </div>
        <div className="real-list-item-qr-code-container">
          <QRCodeCanvas
            value={qrUrl}
            size={300}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
            style={{
              borderRadius: "12px",
              padding: "1rem",
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          />
        </div>
        <p className="real-list-item-qr-modal-hint">
          Scanne den QR-Code, um das Event zu öffnen
        </p>
      </div>
    </div>
  );
};

