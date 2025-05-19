import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FeedResponse } from "../../utils";
import { FeedModal } from "../Feed/FeedModal";
import { useFeed } from "../Feed/useFeed";
import "./ProfileBubble.css";
import { ProfileFeedCard } from "./ProfileFeedCard";
interface ProfileBubbleProps {
  feedItemsResponse: FeedResponse[];
  size?: "small" | "large";
}

export const ProfileBubble = ({
  feedItemsResponse,
  size = "small",
}: ProfileBubbleProps) => {
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

  setFeedItems(feedItemsResponse || []);

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
    const el = scrollContainer.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollPosition);
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
    <div className={`profile-feed-wrapper ${size === "large" ? "large" : ""}`}>
      {!isAtStart && (
        <button
          className="scroll-button scroll-button-left"
          onClick={() => scroll("left")}
        >
          <ChevronLeft />
        </button>
      )}

      <div ref={scrollContainer} className={`profile-feed-container`}>
        <ProfileFeedCard
          key={feedItemsResponse[0].profileId}
          feed={feedItemsResponse[0]}
          setShowFeedModal={setIsFeedModalOpen}
          setCurrentFeedItem={setCurrentFeedItem}
          size={size}
        />
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
  );
};
