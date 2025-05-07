import { useEffect, useState } from "react";
import { FeedResponse } from "../../../utils";
import { FeedCard } from "../../Feed/FeedCard";
import { FeedModal } from "../../Feed/FeedModal";
import { getFeedItems } from "./service";
export const ProfileFeed = ({ profileId }: { profileId: string }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [showFeedModal, setShowFeedModal] = useState(true);
  const [currentFeedItem, setCurrentFeedItem] = useState<FeedResponse | null>(
    null
  );
  useEffect(() => {
    const fetchFeedItems = async () => {
      const items = await getFeedItems(profileId);
      setFeedItems(items);
    };
    fetchFeedItems();
  }, [profileId]);
  return (
    <div className="profile-feed-container">
      {showFeedModal && (
        <FeedModal
          showFeedModal={showFeedModal}
          currentFeedItem={currentFeedItem}
          setShowFeedModal={setShowFeedModal}
          setCurrentFeedItem={setCurrentFeedItem}
        />
      )}
      {feedItems.map((item) => (
        <FeedCard
          key={item.id}
          feed={item}
          setShowFeedModal={setShowFeedModal}
          setCurrentFeedItem={setCurrentFeedItem}
        />
      ))}
    </div>
  );
};
