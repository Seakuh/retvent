import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FeedResponse } from "../../utils";
import "./FeedModal.css";
interface FeedModalProps {
  showFeedModal: boolean;
  setShowFeedModal: (showFeedModal: boolean) => void;
  feedItem: FeedResponse;
  showNextFeed: () => void;
}

export const FeedModal = ({
  setShowFeedModal,
  feedItem,
  showNextFeed,
}: FeedModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const startProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          handleNext(); // Weiter zum nächsten Bild
          return 0;
        }
        return prev + (100 / 5000) * 100; // 5000ms = 5 Sekunden
      });
    }, 100);
  };

  useEffect(() => {
    startProgress();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentImageIndex]);

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : feedItem.feedItems!.length - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev < feedItem.feedItems!.length - 1 ? prev + 1 : 0
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
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
        <div className="progress-container">
          {feedItem.feedItems!.map((_, idx) => (
            <div key={idx} className="progress-bar-container ">
              <div
                className="progress-bar"
                style={{
                  width: `${
                    idx === currentImageIndex
                      ? progress
                      : idx < currentImageIndex
                      ? 100
                      : 0
                  }%`,
                }}
              />
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
            src={feedItem.profileImageUrl}
            alt={feedItem.profileName}
          />
          <h2 className="feed-modal-profile-name">{feedItem.profileName}</h2>
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
            src={feedItem.feedItems![currentImageIndex].feedImageUrl}
            alt={`${feedItem.profileName} - Picture ${currentImageIndex + 1}`}
          />
        </div>
        <button className="nav-button prev-button" onClick={handlePrev}>
          <ChevronLeft />
        </button>
        <button className="nav-button next-button" onClick={handleNext}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
