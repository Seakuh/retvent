import { useEffect, useState } from "react";
import { FeedResponse } from "../../utils";
import "./ExploreFeed.css";
import { FeedCard } from "./FeedCard";
import { FeedModal } from "./FeedModal";
import { getLatestFeedAll } from "./service";
import { useFeed } from "./useFeed";

export const ExploreFeed = () => {
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    setCurrentFeedItem,
    setFeedItems,
    feedItems,
    isFeedModalOpen,
    setIsFeedModalOpen,
    currentImageIndex,
    setCurrentImageIndex,
    showNextFeed,
  } = useFeed();

  useEffect(() => {
    getLatestFeedAll().then((feedsResponse: FeedResponse[]) => {
      setIsLoading(false);
      setCurrentFeedItem(feedsResponse[0]);
      setFeedItems(feedsResponse);
    });
  }, []);

  return (
    <div>
      {isLoading ? (
        <div className="loading container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      ) : (
        <div>
          {/* <div className="section-title">Explore </div> */}
          <div className="explore-feed-container">
            {feedItems.map((feed) => (
              <FeedCard
                key={feed.profileId}
                feed={feed}
                isFeedModalOpen={isFeedModalOpen}
                setIsFeedModalOpen={setIsFeedModalOpen}
              />
            ))}
          </div>
          {isFeedModalOpen && (
            <FeedModal
              feedItem={feeds[currentImageIndex]}
              setShowFeedModal={setIsFeedModalOpen}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              showNextFeed={showNextFeed}
            />
          )}
        </div>
      )}
    </div>
  );
};
