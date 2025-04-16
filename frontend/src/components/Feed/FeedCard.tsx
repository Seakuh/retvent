import { useEffect, useState } from "react";
import { defaultProfileImage, FeedResponse } from "../../utils";
import "./FeedCard.css";
import { FeedModal } from "./FeedModal";
export const FeedCard = ({ feed }: { feed: FeedResponse }) => {
  console.log("###########FEEDCARD", feed);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showNextFeed, setShowNextFeed] = useState(false);

  useEffect(() => {
    if (feed.feedItems?.length && feed.feedItems.length > 1) {
      setShowNextFeed(true);
    }
  }, [feed.feedItems]);

  const showNextFeedForUser = () => {
    if (feed.feedItems?.length && feed.feedItems.length > 1) {
      setShowFeedModal(true);
    }
  };
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
          showNextFeed={showNextFeedForUser}
        />
      )}
    </div>
  );
};
