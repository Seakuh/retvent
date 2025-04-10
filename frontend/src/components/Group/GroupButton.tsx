import { MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import "./GroupButton.css";
import { GroupInviteModal } from "./GroupInviteModal";
export const GroupButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="group-button-container" onClick={handleClick}>
      {isModalOpen && (
        <GroupInviteModal onClose={() => setIsModalOpen(false)} />
      )}
      <div className="group-button-icon-container">
        <MessageSquareIcon className="group-button-icon h-7 w-7" />
      </div>
    </div>
  );
};
