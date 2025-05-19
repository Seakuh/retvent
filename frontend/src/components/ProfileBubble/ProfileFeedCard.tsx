import { defaultProfileImage, Feed, FeedResponse } from "../../utils";
import "./ProfileFeedCard.css";
export const ProfileFeedCard = ({
  feed,
  setShowFeedModal,
  setCurrentFeedItem,
  size = "small",
}: {
  feed: FeedResponse;
  setShowFeedModal: (showFeedModal: boolean) => void;
  setCurrentFeedItem: (currentFeedItem: Feed) => void;
  size?: "small" | "large";
}) => {
  console.log(size);
  return (
    <div className="profile-feed-card-container">
      <div
        className={`profile-feed-card-border ${
          size === "large" ? "large" : ""
        }`}
        onClick={() => {
          setCurrentFeedItem(feed);
          setShowFeedModal(true);
        }}
      >
        <div className="profile-feed-card-inner">
          <img
            className="profile-feed-card-image"
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
    </div>
  );
};
