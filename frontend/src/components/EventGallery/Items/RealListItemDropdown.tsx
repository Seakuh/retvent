import { Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RealListItemDropdown.css";
import { RealListItemQrModal } from "./RealListItemQrModal";

interface RealListItemDropdownProps {
  eventId: string;
  onShare: (e: React.MouseEvent<HTMLDivElement>, event: Event) => void;
}

export const RealListItemDropdown: React.FC<RealListItemDropdownProps> = ({
  eventId,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShare = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onShare(e, eventId);
    handleClose();
  };

  const handleQrCode = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowQrModal(true);
    handleClose();
  };

  const handleReport = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    navigate("/imprint", { state: { reportEventId: eventId } });
    handleClose();
  };

  return (
    <>
      <div className="real-list-item-dropdown-container">
        <button
          className="real-list-item-dropdown-trigger"
          onClick={handleToggle}
          type="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="4" r="2" fill="#fff" />
            <circle cx="12" cy="12" r="2" fill="#fff" />
            <circle cx="12" cy="20" r="2" fill="#fff" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="real-list-item-dropdown-overlay"
              onClick={handleClose}
            />
            <div className="real-list-item-dropdown-content">
              <div
                className="real-list-item-dropdown-item"
                onClick={handleShare}
              >
                <Send size={18} style={{ marginRight: 8 }} />Share
              </div>
              <div
                className="real-list-item-dropdown-item"
                onClick={handleQrCode}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <rect
                    x="2"
                    y="2"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#555"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="2"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#555"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#555"
                    strokeWidth="2"
                  />
                  <path
                    stroke="#555"
                    strokeWidth="2"
                    d="M4 12v2m4-2v2m6-2h2m0 4h2"
                  />
                </svg>
                QR-Code
              </div>
              <div
                className="real-list-item-dropdown-item real-list-item-dropdown-item-danger"
                onClick={handleReport}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <path
                    d="M12 3v12m0 0l3.5-3.5M12 15l-3.5-3.5"
                    stroke="#f00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="3"
                    y="21"
                    width="18"
                    height="2"
                    rx="1"
                    fill="#f00"
                  />
                </svg>
                Report
              </div>
            </div>
          </>
        )}
      </div>

      {showQrModal && (
        <RealListItemQrModal
          eventId={eventId}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
};

