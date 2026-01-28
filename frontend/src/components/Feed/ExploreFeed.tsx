import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FeedResponse } from "../../utils";
import "./ExploreFeed.css";
import { FeedCard } from "./FeedCard";
import { FeedModal } from "./FeedModal";
import { useFeed } from "./useFeed";

interface ExploreFeedProps {
  feedItemsResponse: FeedResponse[];
}

export const ExploreFeed = ({ feedItemsResponse }: ExploreFeedProps) => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const {
    setCurrentFeedItem,
    setFeedItems,
    feedItems,
    currentFeedItem,
    isFeedModalOpen,
    setIsFeedModalOpen,
  } = useFeed();

  const scrollContainer = useRef<HTMLDivElement>(null);

  // Move setFeedItems to useEffect to avoid render-time side effects
  useEffect(() => {
    if (feedItemsResponse && feedItemsResponse.length > 0) {
      setFeedItems(feedItemsResponse);
    }
  }, [feedItemsResponse, setFeedItems]);

  const checkScrollPosition = () => {
    const el = scrollContainer.current;
    if (!el) return;

    setIsAtStart(el.scrollLeft === 0);
    setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainer.current;
    if (el) {
      const scrollAmount = 300;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Timeout gibt dem scrollBy Zeit, damit checkScrollPosition danach richtig greift
      setTimeout(checkScrollPosition, 100);
    }
  };

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;

    // Use passive listener for better scroll performance
    el.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition(); // initialer Check

    return () => el.removeEventListener("scroll", checkScrollPosition);
  }, [feedItems]);

  const showNextFeed = () => {
    const currentIndex = feedItems.findIndex(
      (item) => item.profileId === currentFeedItem?.profileId
    );
    if (currentIndex === feedItems.length - 1) {
      setIsFeedModalOpen(false);
    }
    setCurrentFeedItem(feedItems[currentIndex + 1]);
  };

  const showPreviousFeed = () => {
    const currentIndex = feedItems.findIndex(
      (item) => item.profileId === currentFeedItem?.profileId
    );
    if (currentIndex === 0) {
      setIsFeedModalOpen(false);
    }
    setCurrentFeedItem(feedItems[currentIndex - 1]);
  };

  return (
    <div className="explore-feed-wrapper">
      <button
        className={`scroll-button scroll-button-left ${isAtStart ? 'hidden' : ''}`}
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        <ChevronLeft />
      </button>

      <div ref={scrollContainer} className="explore-feed-container">
        {feedItems.map((feed) => (
          <FeedCard
            key={feed.profileId}
            feed={feed}
            setShowFeedModal={setIsFeedModalOpen}
            setCurrentFeedItem={setCurrentFeedItem}
          />
        ))}
      </div>

      <button
        className={`scroll-button scroll-button-right ${isAtEnd ? 'hidden' : ''}`}
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        <ChevronRight />
      </button>

      {isFeedModalOpen && (
        <FeedModal
          showFeedModal={isFeedModalOpen}
          feedItem={currentFeedItem!}
          setShowFeedModal={setIsFeedModalOpen}
          showNextFeed={showNextFeed}
          showPreviousFeed={showPreviousFeed}
        />
      )}
    </div>
  );
};
