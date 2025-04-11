import { MessageSquareIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./GroupInvite.css";
import { joinGroup } from "./service";
export const GroupInvite = () => {
  const { userId, tokenId } = useParams();
  const navigate = useNavigate();

  const handleJoinGroup = async () => {
    const response = await joinGroup(tokenId!);
    console.log(response);
    navigate(`/group/${response._id}`);
  };

  return (
    <div className="group-invite-container">
      <div className="group-invite-content">
        <MessageSquareIcon className="w-20 h-20 text-white mx-auto mb-4" />
        <h1 className="section-title">Group Invite</h1>
        <p>{userId} invited you to join their group for this event</p>
        <div className="group-invite-button-container">
          <button onClick={handleJoinGroup}>Join Group</button>
        </div>
      </div>
      <h1 className="section-title">Event-Scanner</h1>
      <a href="https://event-scanner.com">
        <img
          src="/logo.png"
          alt="Event-Scanner"
          className="w-20 h-20 mx-auto border border-[var(--color-neon-blue)] rounded-xl"
        />
      </a>{" "}
    </div>
  );
};
