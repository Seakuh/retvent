import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const scrollAmount = 300; // Anpassen nach Bedarf
      scrollContainer.current.scrollLeft +=
        direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

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
        <div className="explore-feed-wrapper">
          <button
            className="scroll-button scroll-button-left"
            onClick={() => scroll("left")}
          >
            <ChevronLeft />
          </button>

          <div ref={scrollContainer} className="explore-feed-container">
            {feedItems.map((feed) => (
              <FeedCard
                key={feed.profileId}
                feed={feed}
                isFeedModalOpen={isFeedModalOpen}
                setIsFeedModalOpen={setIsFeedModalOpen}
              />
            ))}
          </div>

          <button
            className="scroll-button scroll-button-right"
            onClick={() => scroll("right")}
          >
            <ChevronRight />
          </button>

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
