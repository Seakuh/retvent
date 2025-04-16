import { FeedResponse } from "../../utils";
import "./FeedModal.css";
export const FeedModal = ({
  setShowFeedModal,
  feedItem,
}: {
  showFeedModal: boolean;
  setShowFeedModal: (showFeedModal: boolean) => void;
  feedItem: FeedResponse;
}) => {
  console.log("###########FEED", feedItem);
  return (
    <div
      className="search-modal-overlay"
      onClick={() => setShowFeedModal(false)}
    >
      <div className="search-modal-content">
        <h2>{feedItem.profileName}</h2>
        <img
          className="feed-modal-image"
          src={feedItem.profileImageUrl}
          alt={feedItem.profileName}
        />
      </div>
    </div>
  );
};
