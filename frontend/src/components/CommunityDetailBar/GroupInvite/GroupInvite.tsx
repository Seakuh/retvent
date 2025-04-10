import { useNavigate, useParams } from "react-router-dom";

export const GroupInvite = () => {
  const { userId, tokenId } = useParams();
  const navigate = useNavigate();

  const handleJoinGroup = () => {
    console.log("Join Group");
  };

  const handleDecline = () => {
    navigate("/");
  };

  return (
    <div className="group-invite-container">
      <div className="group-invite-content">
        <h1>Group Invite</h1>
        <p>{userId} invited you to join their group for this event</p>
        <div className="group-invite-button-container">
          <button onClick={handleJoinGroup}>Join Group</button>
          <button onClick={handleDecline}>Decline</button>
        </div>
      </div>
    </div>
  );
};
