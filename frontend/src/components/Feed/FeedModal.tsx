import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FeedResponse, formatDate } from "../../utils";
import "./FeedModal.css";

interface FeedModalProps {
  showFeedModal: boolean;
  setShowFeedModal: (showFeedModal: boolean) => void;
  feedItem: FeedResponse;
  showNextFeed: () => void;
  showPreviousFeed: () => void;
}

export const FeedModal = ({
  setShowFeedModal,
  feedItem,
  showNextFeed,
  showPreviousFeed,
}: FeedModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Reset animation and timer when image changes
  useEffect(() => {
    setAnimationKey((prevKey) => prevKey + 1);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isPaused) {
      timerRef.current = setTimeout(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentImageIndex, feedItem, isPaused]);

  const handlePause = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handlePlay = () => {
    setIsPaused(false);
    // Starte den Timer neu
    timerRef.current = setTimeout(() => {
      handleNext();
    }, 5000);
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(0);
      showPreviousFeed();
    }
  };

  const handleNext = () => {
    if (currentImageIndex < feedItem.feedItems!.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0);
      showNextFeed();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentImageIndex(0);
      showNextFeed();
    },
    onSwipedRight: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentImageIndex(0);
      showPreviousFeed();
    },
  });

  return (
    <div
      className="feed-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowFeedModal(false);
      }}
    >
      <div
        className="feed-modal-content"
        {...handlers}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowFeedModal(false);
        }}
      >
        <div className="feed-progress-container">
          {feedItem.feedItems!.map((_, idx) => (
            <div key={idx} className="feed-progress-bar-container">
              {idx === currentImageIndex ? (
                <div
                  key={animationKey}
                  className={`feed-progress-bar ${
                    isPaused ? "paused" : "active"
                  }`}
                />
              ) : (
                <div
                  className={`feed-progress-bar ${
                    idx < currentImageIndex ? "completed" : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="feed-modal-profile-container"
          onClick={() => {
            navigate(`/profile/${feedItem.profileId}`);
          }}
        >
          <img
            className="feed-modal-profile-image"
            src={`https://img.event-scanner.com/insecure/rs:fill:96:96/plain/${feedItem.profileImageUrl}@webp`}
            alt={feedItem.profileName}
          />
          <h2 className="feed-modal-profile-name">{feedItem.profileName}</h2>
          <p className="feed-modal-profile-created-at">
            {feedItem.feedItems![currentImageIndex].startDate
              ? formatDate(
                  feedItem.feedItems![currentImageIndex].startDate.toString()
                )
              : ""}
          </p>
        </div>
        <div
          className="feed-modal-image-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFeedModal(false);
          }}
        >
          <img
            className="feed-modal-image"
            onClick={() => {
              navigate(
                `/event/${feedItem.feedItems![currentImageIndex].eventId}`
              );
            }}
            src={`https://img.event-scanner.com/insecure/rs:auto/plain/${
              feedItem.feedItems![currentImageIndex].feedImageUrl
            }@webp`}
            alt={`${feedItem.profileName} - Picture ${currentImageIndex + 1}`}
          />
        </div>
        <button className="nav-button prev-button" onClick={handlePrev}>
          <ChevronLeft />
        </button>
        <button className="nav-button next-button" onClick={handleNext}>
          <ChevronRight />
        </button>
        {isPaused ? (
          <button className="break-button" onClick={handlePlay}>
            <Play />
          </button>
        ) : (
          <button className="break-button" onClick={handlePause}>
            <Pause />
          </button>
        )}
        <button
          className="close-button"
          onClick={() => setShowFeedModal(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
