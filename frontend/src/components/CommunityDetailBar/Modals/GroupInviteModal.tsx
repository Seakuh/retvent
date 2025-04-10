import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { createGroup } from "../service";
import "./GroupInviteModal.css";

interface GroupResponse {
  inviteToken: string;
  name: string;
}

export const GroupInviteModal = ({
  onClose,
  eventId,
}: {
  onClose: () => void;
  eventId: string;
}) => {
  const [groupData, setGroupData] = useState<GroupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createGroup(eventId);
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
            <QRCodeSVG value={groupData.inviteToken} size={256} level="H" />
            <p>Token: {groupData.inviteToken}</p>
          </div>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
