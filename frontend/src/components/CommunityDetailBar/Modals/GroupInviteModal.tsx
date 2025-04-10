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
            <h3>{groupData.name}</h3>
            <QRCodeCanvas
              value={`${FRONTEND_URL}group/invite/${userId}/${groupData.inviteToken}`}
              size={256}
              level="H"
            />
            <p>Token: {groupData.inviteToken}</p>
          </div>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
