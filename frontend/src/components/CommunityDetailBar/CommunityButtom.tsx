import { MessageSquareIcon, QrCode, UserPlus } from "lucide-react";
import "./CommunityButton.css";

interface CommunityButtonProps {
  type: "group" | "add" | "share";
  onClick: () => void;
}

export const CommunityButton = ({ type, onClick }: CommunityButtonProps) => {
  return (
    <div className="community-button-container" onClick={onClick}>
      <div className="community-button-icon-container">
        {type === "group" && (
          <MessageSquareIcon className="community-button-icon h-5 w-5" />
        )}
        {type === "add" && (
          <UserPlus className="community-button-icon h-5 w-5" />
        )}
        {type === "share" && (
          <QrCode className="community-button-icon h-5 w-5" />
        )}
      </div>
    </div>
  );
};
