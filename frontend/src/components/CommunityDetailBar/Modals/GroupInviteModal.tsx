import { Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Event, FRONTEND_URL } from "../../../utils";
import { createGroup } from "../service";
import "./GroupInviteModal.css";

interface GroupResponse {
  inviteToken: string;
  name: string;
  event: Event;
}

export const GroupInviteModal = ({
  onClose,
  event,
  userId,
}: {
  onClose: () => void;
  event: Event;
  userId: string;
}) => {
  const [groupData, setGroupData] = useState<GroupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupData) return;
    createGroup(event).then((data) => {
      setGroupData(data);
    });
  }, []);

  return (
    <div className="group-invite-modal-container" onClick={() => onClose()}>
      <div className="section-title">Invite to Group</div>
      <div
        className="group-invite-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {error && <div className="error-message">{error}</div>}

        {groupData && (
          <div className="qr-code-container">
            <QRCodeCanvas
              value={`${FRONTEND_URL}group/invite/${userId}/${groupData.inviteToken}`}
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
        )}
        <button
          className="group-invite-link-text-button"
          onClick={() => {
            navigator.clipboard.writeText(
              `${FRONTEND_URL}group/invite/${userId}/${groupData?.inviteToken}`
            );
            alert("Copied to clipboard");
          }}
        >
          <Copy className="copy-icon" size={24} />
        </button>
      </div>
    </div>
  );
};
