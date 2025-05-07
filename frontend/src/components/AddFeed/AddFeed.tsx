import { useState } from "react";
import { defaultProfileImage, Feed } from "../../utils";
import "./AddFeed.css";
import { AddFeedModal } from "./AddFeedModal";
import { addFeed } from "./service";

export const AddFeed = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleAddFeed = async (feed: Feed) => {
    await addFeed(feed);
    handleClose();
  };

  return (
    <div className="add-feed-container" onClick={handleOpen}>
      <div className="profile-card-container">
        <div className="profile-card-border">
          <div className="profile-card-inner">
            <img
              className="profile-card-image"
              src={defaultProfileImage}
              alt={"Profile"}
              loading="lazy"
            />
          </div>
        </div>
        <div className="profile-card-username-container">
          <h3 className="profile-card-username">Add Feed</h3>
        </div>
      </div>
      {isOpen && (
        <div className="add-feed-modal" onClick={(e) => e.stopPropagation()}>
          <AddFeedModal onAddFeed={handleAddFeed} handleClose={handleClose} />
        </div>
      )}
    </div>
  );
};
