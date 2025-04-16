import { useState } from "react";
import { defaultProfileImage, FeedResponse } from "../../utils";
import "./FeedCard.css";
import { FeedModal } from "./FeedModal";
export const FeedCard = ({ feed }: { feed: FeedResponse }) => {
  const [showFeedModal, setShowFeedModal] = useState(false);
  console.log("###########FEEDCARD", feed);
  return (
    <div className="profile-card-container">
      <div
        className="profile-card-border"
        onClick={() => setShowFeedModal(true)}
      >
        <div className="profile-card-inner">
          <img
            className="profile-card-image"
            src={feed.profileImageUrl || defaultProfileImage}
            alt={feed.profileName || "Profile"}
          />
        </div>
      </div>
      <div className="profile-card-username-container">
        <h3 className="profile-card-username">
          {feed.profileName || "Profile"}
        </h3>
      </div>
      {showFeedModal && (
        <FeedModal
          showFeedModal={showFeedModal}
          setShowFeedModal={setShowFeedModal}
          feedItem={feed}
        />
      )}
    </div>
  );
};
