import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { FRONTEND_URL } from "../../../utils";
import { createGroup } from "../service";
import "./GroupInviteModal.css";

interface GroupResponse {
  inviteToken: string;
  name: string;
}

export const GroupInviteModal = ({
  onClose,
  eventId,
  userId,
}: {
  onClose: () => void;
  eventId: string;
  userId: string;
}) => {
  const [groupData, setGroupData] = useState<GroupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createGroup(eventId).then((data) => {
      setGroupData(data);
    });
  }, []);

  return (
    <div className="group-invite-modal-container" onClick={() => onClose()}>
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
      </div>
    </div>
  );
};
