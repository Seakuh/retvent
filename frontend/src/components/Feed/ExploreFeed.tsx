import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FeedResponse } from "../../utils";
import "./ExploreFeed.css";
import { FeedCard } from "./FeedCard";
import { FeedModal } from "./FeedModal";
import { getLatestFeedAll } from "./service";
import { useFeed } from "./useFeed";

export const ExploreFeed = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const {
    setCurrentFeedItem,
    setFeedItems,
    feedItems,
    currentFeedItem,
    isFeedModalOpen,
    setIsFeedModalOpen,
    setFeedItemIndex,
    feedItemIndex,
  } = useFeed();

  const scrollContainer = useRef<HTMLDivElement>(null);

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
    getLatestFeedAll().then((feedsResponse: FeedResponse[]) => {
      setIsLoading(false);
      setFeedItems(feedsResponse);
    });
  }, []);

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition(); // initialer Check

    return () => el.removeEventListener("scroll", checkScrollPosition);
  }, [feedItems]);

  const showNextFeed = () => {
    console.log("###########SHOWNEXTFEED", currentFeedItem);
    const currentIndex = feedItems.findIndex(
      (item) => item.profileId === currentFeedItem?.profileId
    );
    console.log("###########FEEDITEMS", feedItems[currentIndex + 1]);
    setCurrentFeedItem(feedItems[currentIndex + 1]);
  };

  const showPreviousFeed = () => {
    const currentIndex = feedItems.findIndex(
      (item) => item.profileId === currentFeedItem?.profileId
    );
    setCurrentFeedItem(feedItems[currentIndex - 1]);
  };

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
          {!isAtStart && (
            <button
              className="scroll-button scroll-button-left"
              onClick={() => scroll("left")}
            >
              <ChevronLeft />
            </button>
          )}

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

          {!isAtEnd && (
            <button
              className="scroll-button scroll-button-right"
              onClick={() => scroll("right")}
            >
              <ChevronRight />
            </button>
          )}

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
      )}
    </div>
  );
};
