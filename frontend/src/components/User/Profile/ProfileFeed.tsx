import { useEffect, useState } from "react";
import { FeedCard } from "../../Feed/FeedCard";
import { getFeedItems } from "./service";

export const ProfileFeed = ({ profileId }: { profileId: string }) => {
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    const fetchFeedItems = async () => {
      const items = await getFeedItems(profileId);
      setFeedItems(items);
    };
    fetchFeedItems();
  }, [profileId]);
  return (
    <div>
      {feedItems.map((item) => (
        <FeedCard
          key={item.id}
          feed={item}
          setShowFeedModal={() => {}}
          setCurrentFeedItem={() => {}}
        />
      ))}
    </div>
  );
};
