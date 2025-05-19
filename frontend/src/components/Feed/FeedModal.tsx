import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FeedResponse, formatDate } from "../../utils";
import "./FeedModal.css";
import { FeedModalActionBar } from "./FeedModalActionBar";

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
  const [isImageLoading, setIsImageLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Reset animation and timer when image changes
  useEffect(() => {
    setAnimationKey((prevKey) => prevKey + 1);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isPaused && !isImageLoading) {
      timerRef.current = setTimeout(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentImageIndex, feedItem, isPaused, isImageLoading]);

  // Verbesserte Vorladefunktion mit Promise
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = `https://img.event-scanner.com/insecure/rs:auto/plain/${url}@webp`;
    });
  };

  // Vorladen aller relevanten Bilder
  useEffect(() => {
    const loadImages = async () => {
      if (feedItem.feedItems) {
        setIsImageLoading(true);
        try {
          // Aktuelles Bild
          await preloadImage(
            feedItem.feedItems[currentImageIndex].feedImageUrl
          );

          // Nächstes Bild im aktuellen Feed
          if (currentImageIndex < feedItem.feedItems.length - 1) {
            preloadImage(
              feedItem.feedItems[currentImageIndex + 1].feedImageUrl
            );
          }

          // Vorheriges Bild im aktuellen Feed
          if (currentImageIndex > 0) {
            preloadImage(
              feedItem.feedItems[currentImageIndex - 1].feedImageUrl
            );
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bilder:", error);
        } finally {
          setIsImageLoading(false);
        }
      }
    };

    loadImages();
  }, [currentImageIndex, feedItem.feedItems]);

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

  // Verbesserte handleNext Funktion
  const handleNext = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentImageIndex < feedItem.feedItems!.length - 1) {
      setIsImageLoading(true);
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setIsImageLoading(true);
      setCurrentImageIndex(0);
      showNextFeed();
    }
  };

  // Verbesserte handlePrev Funktion
  const handlePrev = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentImageIndex > 0) {
      setIsImageLoading(true);
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setIsImageLoading(true);
      setCurrentImageIndex(0);
      showPreviousFeed();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsImageLoading(true);
      setCurrentImageIndex(0);
      showNextFeed();
    },
    onSwipedRight: async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsImageLoading(true);
      setCurrentImageIndex(0);
      showPreviousFeed();
    },
    onSwipedDown: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowFeedModal(false);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Füge Event Listener für Pfeiltasten hinzu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFeedModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [currentImageIndex, feedItem.feedItems]);

  return (
    <div
      className="feed-modal-overlay"
      // onClick={(e) => {
      //   if (e.target === e.currentTarget) setShowFeedModal(false);
      // }}
    >
      <div
        className="feed-modal-content"
        {...handlers}
        // onClick={(e) => {
        //   if (e.target === e.currentTarget) setShowFeedModal(false);
        // }}
      >
        <div className="feed-modal-blur-background">
          <img
            src={`https://img.event-scanner.com/insecure/rs:auto/plain/${
              feedItem.feedItems![currentImageIndex].feedImageUrl
            }@webp`}
            alt="blurred background"
          />
        </div>

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
          {/* <button
            className="follow-button"
            onClick={() => handleFollow(feedItem.profileId)}
          >
            Follow
          </button> */}
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
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            // Wenn auf der linken Seite geklickt wird
            if (x < width / 2) {
              handlePrev();
            }
            // Wenn auf der rechten Seite geklickt wird
            else {
              handleNext();
            }
          }}
        >
          {isImageLoading && (
            <div className="image-loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
          <img
            className={`feed-modal-image ${isImageLoading ? "loading" : ""}`}
            loading="eager"
            src={`https://img.event-scanner.com/insecure/rs:auto/plain/${
              feedItem.feedItems![currentImageIndex].feedImageUrl
            }@webp`}
            alt={`${feedItem.profileName} - Picture ${currentImageIndex + 1}`}
            onError={() => {
              setIsImageLoading(false);
              console.error("Error while loading image");
            }}
          />
          <div
            className="feed-modal-event-click-area"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/event/${feedItem.feedItems![currentImageIndex].eventId}`
              );
            }}
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
          className="close-feed-modal-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowFeedModal(false);
          }}
        >
          <X size={30} />
        </button>

        {feedItem.feedItems![currentImageIndex].eventId && (
          <FeedModalActionBar
            eventId={feedItem.feedItems![currentImageIndex].eventId}
            feed={feedItem.feedItems![currentImageIndex]}
          />
        )}
      </div>
    </div>
  );
};
