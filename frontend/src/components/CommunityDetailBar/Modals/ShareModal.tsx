import { QRCodeCanvas } from "qrcode.react";
import { Event, getEventUrl } from "../../../utils";
import "./GroupInviteModal.css";

export const ShareModal = ({
  onClose,
  event,
}: {
  onClose: () => void;
  event: Event;
}) => {
  const eventUrl = getEventUrl(event);
  const fullUrl = `https://event-scanner.com${eventUrl}`;
  
  return (
    <div className="group-invite-modal-container" onClick={() => onClose()}>
      <div
        className="group-invite-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qr-code-container">
          <QRCodeCanvas
            value={fullUrl}
            size={420}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
            style={{
              borderRadius: "10px",
              padding: "0.5rem",
              backgroundColor: "black",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
