import "./GroupInviteModal.css";

export const GroupInviteModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="group-invite-modal-container" onClick={() => onClose()}>
      <div
        className="group-invite-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Invite to Group</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
