import { useState } from "react";
import { defaultProfileImage, Feed } from "../../utils";
import "./FeedCard.css";
import { FeedModal } from "./FeedModal";
export const FeedCard = ({ feed }: { feed: Feed }) => {
  const [showFeedModal, setShowFeedModal] = useState(false);
  return (
    <div className="profile-card-container">
      <div
        className="profile-card-border"
        onClick={() => setShowFeedModal(true)}
      >
        <div className="profile-card-inner">
          <img
            className="profile-card-image"
            src={feed.feedImageUrl || defaultProfileImage}
            alt={feed.type}
          />
        </div>
      </div>
      <div className="profile-card-username-container">
        <h3 className="profile-card-username">{feed.username || "Profile"}</h3>
      </div>
      {showFeedModal && (
        <FeedModal
          showFeedModal={showFeedModal}
          setShowFeedModal={setShowFeedModal}
        />
      )}
    </div>
  );
};
