import { useEffect, useState } from "react";
import { FeedResponse } from "../../utils";
import "./ExploreFeed.css";
import { FeedCard } from "./FeedCard";
import { getLatestFeedAll } from "./service";

export const ExploreFeed = () => {
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getLatestFeedAll().then((feedsResponse: FeedResponse[]) => {
      setFeeds(feedsResponse || []);
      setIsLoading(false);
      console.log("###########FEEDSFIIIIRSSTT", feeds);
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
          <div className="explore-feed-container">
            {feeds.map((feed) => (
              <FeedCard key={feed.profileId} feed={feed} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
