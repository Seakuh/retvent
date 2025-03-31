import { useState } from "react";
import "./ActionComponent.css";

interface ActionComponentProps {
  isFollowingWIP?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

export const ActionComponent = ({
  isFollowingWIP,
  onFollow,
  onMessage,
}: ActionComponentProps) => {
  const [isFollowing, setIsFollowing] = useState(isFollowingWIP || false);
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  const handleMessage = () => {
    onMessage?.();
  };

  return (
    <div className="action-component-container">
      <div className="action-component-content">
        <button
          className={`follow-button action-component-button ${
            isFollowing ? "following" : ""
          }`}
          onClick={handleFollow}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
        <button className="action-component-button" onClick={handleMessage}>
          Message
        </button>
      </div>
    </div>
  );
};
