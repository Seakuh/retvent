import { defaultProfileImage, FeedResponse } from "../../utils";
import "./ProfileFeedCard.css";

interface ProfileFeedCardProps {
  feed: FeedResponse;
  setShowFeedModal: (show: boolean) => void;
  setCurrentFeedItem: (item: FeedResponse) => void;
  size?: "small" | "large";
  onFeedCardClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  profileImageUrl: string;
}

export const ProfileFeedCard = ({
  feed,
  size = "small",
  onFeedCardClick,
  profileImageUrl,
}: ProfileFeedCardProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onFeedCardClick(e);
  };

  return (
    <div className="profile-feed-card-container">
      <div
        className={`profile-feed-card-border ${
          size === "large" ? "large" : ""
        }`}
        onClick={handleClick}
      >
        <div className="profile-feed-card-inner">
          <img
            className="profile-feed-card-image"
            src={
              profileImageUrl
                ? `https://img.event-scanner.com/insecure/rs:fill:96:96/plain/${profileImageUrl}@webp`
                : defaultProfileImage
            }
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
