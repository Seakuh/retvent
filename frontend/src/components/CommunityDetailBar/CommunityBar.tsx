import { useState } from "react";
import "./CommunityBar.css";
import { CommunityButton } from "./CommunityButtom";
import { AddModal } from "./Modals/AddModal";
import { GroupInviteModal } from "./Modals/GroupInviteModal";

export const CommunityBar = () => {
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleGroupClick = () => {
    console.log("Group clicked");
    setIsGroupInviteModalOpen(true);
  };

  const handleAddClick = () => {
    console.log("Add clicked");
  };

  const handleShareClick = () => {
    console.log("Share clicked");
  };

  return (
    <div className="community-bar-container">
      {isGroupInviteModalOpen && (
        <GroupInviteModal onClose={() => setIsGroupInviteModalOpen(false)} />
      )}
      {isAddModalOpen && <AddModal onClose={() => setIsAddModalOpen(false)} />}

      <CommunityButton type="group" onClick={handleGroupClick} />
      <CommunityButton type="add" onClick={handleAddClick} />
      <CommunityButton type="share" onClick={handleShareClick} />
    </div>
  );
};
