import { useEffect, useState } from "react";
import { Feed } from "../../utils";
import "./ExploreFeed.css";
import { FeedCard } from "./FeedCard";
import { getLatestFeedAll } from "./service";

export const ExploreFeed = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getLatestFeedAll().then((feeds) => {
      setFeeds(feeds);
      setIsLoading(false);
    });
  }, []);
  return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div>
          <div className="section-title">Explore </div>
          <div className="Explore-feed-container">
            {feeds.map((feed) => (
              <FeedCard key={feed._id} feed={feed} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
