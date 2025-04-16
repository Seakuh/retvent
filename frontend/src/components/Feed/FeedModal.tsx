import "./FeedModal.css";
export const FeedModal = ({
  showFeedModal,
  setShowFeedModal,
}: {
  showFeedModal: boolean;
  setShowFeedModal: (showFeedModal: boolean) => void;
}) => {
  return (
    <div
      className="search-modal-overlay"
      onClick={() => setShowFeedModal(false)}
    >
      <div className="search-modal-content">
        <h2>Feed</h2>
      </div>
    </div>
  );
};
