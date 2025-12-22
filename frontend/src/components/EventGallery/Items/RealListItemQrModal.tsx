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

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="real-list-item-qr-modal-overlay"
      onClick={onClose}
    >
      <div
        className="real-list-item-qr-modal-content"
        onClick={handleContentClick}
      >
        <QRCodeCanvas
          value={qrUrl}
          size={400}
          level="H"
          bgColor="#000000"
          fgColor="#FFFFFF"
          includeMargin={true}
        />
      </div>
    </div>
  );
};

