import { defaultProfileImage, Feed, FeedResponse } from "../../utils";
import "./FeedCard.css";
export const FeedCard = ({
  feed,
  setShowFeedModal,
  setCurrentFeedItem,
}: {
  feed?: FeedResponse;
  setShowFeedModal: (showFeedModal: boolean) => void;
  setCurrentFeedItem: (currentFeedItem: Feed) => void;
}) => {
  return (
    <div className="profile-card-container">
      <div
        className="profile-card-border"
        onClick={() => {
          setCurrentFeedItem(feed);
          setShowFeedModal(true);
        }}
      >
        <div className="profile-card-inner">
          <img
            className="profile-card-image"
            src={
              feed.profileImageUrl
                ? `https://img.event-scanner.com/insecure/rs:fill:96:96/plain/${feed.profileImageUrl}@webp`
                : defaultProfileImage
            }
            alt={feed.profileName || "Profile"}
            loading="lazy"
          />
        </div>
      </div>
      <div className="profile-card-username-container">
        <h3 className="profile-card-username">
          {feed.profileName || "Profile"}
        </h3>
      </div>
    </div>
  );
};
