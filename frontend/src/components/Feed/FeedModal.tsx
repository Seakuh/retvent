import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable"; // npm install react-swipeable
import { FeedResponse } from "../../utils";
import "./FeedModal.css";

export const FeedModal = ({
  setShowFeedModal,
  feedItem,
}: {
  showFeedModal: boolean;
  setShowFeedModal: (showFeedModal: boolean) => void;
  feedItem: FeedResponse;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Progress Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Zum nächsten Bild wechseln
          handleNext();
          return 0;
        }
        return prev + (100 / 5000) * 100; // 5000ms = 5 Sekunden
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentImageIndex]);

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : feedItem.feedItems!.length - 1
    );
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev < feedItem.feedItems!.length - 1 ? prev + 1 : 0
    );
    setProgress(0);
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
      <X className="close-button" onClick={() => setShowFeedModal(false)} />
      <div className="feed-modal-content" {...handlers}>
        <div className="progress-container">
          {feedItem.feedItems!.map((_, idx) => (
            <div key={idx} className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${
                    idx === currentImageIndex
                      ? progress
                      : idx < currentImageIndex
                      ? "100"
                      : "0"
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        <h2>{feedItem.profileName}</h2>
        <img
          className="feed-modal-image"
          src={feedItem.feedItems![currentImageIndex].feedImageUrl}
          alt={`${feedItem.profileName} - Picture ${currentImageIndex + 1}`}
        />

        {/* Navigation Buttons - nur auf Desktop sichtbar */}
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
