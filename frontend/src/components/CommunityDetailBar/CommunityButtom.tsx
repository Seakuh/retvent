import { MessageSquareIcon, PlusIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import "./CommunityButton.css";
import { GroupInviteModal } from "./Modals/GroupInviteModal";

const CommunityButtonProps = {
  type: "group" | "add" | "share",
  onClick: () => {},
};

export const CommunityButton = ({ type, onClick }: CommunityButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="community-button-container" onClick={onClick}>
      {isModalOpen && (
        <GroupInviteModal onClose={() => setIsModalOpen(false)} />
      )}
      <div className="community-button-icon-container">
        {type === "group" && (
          <MessageSquareIcon className="community-button-icon h-5 w-5" />
        )}
        {type === "add" && (
          <PlusIcon className="community-button-icon h-5 w-5" />
        )}
        {type === "share" && (
          <ShareIcon className="community-button-icon h-5 w-5" />
        )}
      </div>
    </div>
  );
};
