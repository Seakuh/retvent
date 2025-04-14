import { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import "./CommunityBar.css";
import { CommunityButton } from "./CommunityButtom";
import { AddModal } from "./Modals/AddModal";
import { GroupInviteModal } from "./Modals/GroupInviteModal";
import { ShareModal } from "./Modals/ShareModal";
export const CommunityBar = ({ event }: { event: Event }) => {
  const { user } = useContext(UserContext);
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleGroupClick = () => {
    console.log("Group clicked");
    setIsGroupInviteModalOpen(true);
  };

  const handleAddClick = () => {
    console.log("Add clicked");
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
    console.log("Share clicked");
  };

  return (
    <div className="community-bar-container">
      {isGroupInviteModalOpen && (
        <GroupInviteModal
          onClose={() => setIsGroupInviteModalOpen(false)}
          event={event}
          userId={user?.id || ""}
        />
      )}
      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} event={event} />
      )}
      {isAddModalOpen && <AddModal onClose={() => setIsAddModalOpen(false)} />}

      {/* <CommunityButton type="group" onClick={handleGroupClick} />
      <CommunityButton type="add" onClick={handleAddClick} /> */}
      <CommunityButton type="share" onClick={handleShareClick} />
    </div>
  );
};
