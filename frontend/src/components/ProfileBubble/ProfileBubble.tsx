import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FeedResponse } from "../../utils";
import { FeedModal } from "../Feed/FeedModal";
import { getProfileFeed } from "../Feed/service";
import "./ProfileBubble.css";
import { ProfileFeedCard } from "./ProfileFeedCard";

interface ProfileBubbleProps {
  profileId: string;
  profileImageUrl: string;
  size?: "small" | "large";
}

export const ProfileBubble = ({
  size = "small",
  profileId,
  profileImageUrl,
}: ProfileBubbleProps) => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [currentFeedItem, setCurrentFeedItem] = useState<FeedResponse | null>(
    null
  );
  const [feedItems, setFeedItems] = useState<FeedResponse[]>([]);

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

  const handleFeedCardClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      const data = await getProfileFeed(profileId);
      setFeedItems(data);
      setCurrentFeedItem(data[0]);
      setIsFeedModalOpen(true);
    } catch (error) {
      console.error("Fehler beim Laden des Profile Feeds:", error);
    }
  };

  return (
    <div
      className={`profile-feed-wrapper ${size === "large" ? "large" : "small"}`}
    >
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
          key={profileId + "-profile-feed-card"}
          feed={feedItems[0]}
          profileImageUrl={profileImageUrl}
          setShowFeedModal={setIsFeedModalOpen}
          setCurrentFeedItem={setCurrentFeedItem}
          size={size}
          onFeedCardClick={handleFeedCardClick}
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

      {isFeedModalOpen &&
        createPortal(
          <FeedModal
            showFeedModal={isFeedModalOpen}
            feedItem={currentFeedItem!}
            setShowFeedModal={setIsFeedModalOpen}
            showNextFeed={showNextFeed}
            showPreviousFeed={showPreviousFeed}
          />,
          document.body
        )}
    </div>
  );
};
