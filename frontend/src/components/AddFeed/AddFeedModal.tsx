import { Feed } from "../../utils";
import "./AddFeedModal.css";

interface AddFeedModalProps {
  onAddFeed: (feed: Feed) => void;
  handleClose: () => void;
}

export const AddFeedModal = ({ onAddFeed, handleClose }: AddFeedModalProps) => {
  return (
    <div className="add-feed-modal" onClick={handleClose}>
      <div className="add-feed-modal-content">
        <h2>Add Feed</h2>
      </div>
    </div>
  );
};
