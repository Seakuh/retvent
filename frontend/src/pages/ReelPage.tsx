import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { DEFAULT_IMAGE, Event } from "../utils";
import "./ReelPage.css";
import { getReelEvents } from "./service";

const ReelPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLineup, setShowLineup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [touchStart, setTouchStart] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });
  const [touchEnd, setTouchEnd] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Initial load
  useEffect(() => {
    const fetchInitialEvents = async () => {
      setIsLoading(true);
      try {
        const initialEvents = await getReelEvents(eventId, 0, 10);
        setEvents(initialEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialEvents();
  }, [eventId]);

  useEffect(() => {
    const loadMoreEvents = async () => {
      const newEvents = await getReelEvents("", events.length, 10);
      setEvents((prev) => [...prev, ...newEvents]);
    };
    if (currentIndex === events.length - 2) {
      loadMoreEvents();
    }
  }, [eventId, events.length, currentIndex]);

  const handleSwipe = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (isScrolling) return;

      setIsScrolling(true);

      if (direction === "up" && currentIndex < events.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setShowLineup(false);
      } else if (direction === "down" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setShowLineup(false);
      } else if (direction === "left") {
        setShowLineup(true);
      } else if (direction === "right") {
        setShowLineup(false);
      }

      setTimeout(() => setIsScrolling(false), 300);
    },
    [currentIndex, events.length, isScrolling]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd({ x: null, y: null });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.x || !touchStart.y || !touchEnd.x || !touchEnd.y) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (distanceX > minSwipeDistance) {
        handleSwipe("left");
      } else if (distanceX < -minSwipeDistance) {
        handleSwipe("right");
      }
    } else {
      if (distanceY > minSwipeDistance) {
        handleSwipe("up");
      } else if (distanceY < -minSwipeDistance) {
        // Verhindere Browser-Refresh beim Swipen nach unten
        e.preventDefault();
        handleSwipe("down");
      }
    }
  };

  // Scroll-Handler for Desktop
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;

      if (e.deltaY > 0) {
        // Scroll nach unten = Event nach oben
        handleSwipe("up");
      } else {
        // Scroll nach oben = Event nach unten
        handleSwipe("down");
      }
    },
    [handleSwipe, isScrolling]
  );

  const handleLike = (eventId: string) => {
    if (isFavorite(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  };

  const getDaysUntilEvent = (startDate?: Date | string) => {
    if (!startDate) return 0;
    const eventDate = new Date(startDate);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Event Listeners Setup
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleSwipe("down");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleSwipe("up");
      } else if (e.key === "PageUp") {
        e.preventDefault();
        handleSwipe("down");
      } else if (e.key === "PageDown") {
        e.preventDefault();
        handleSwipe("up");
      } else if (e.key === " ") {
        e.preventDefault();
        handleSwipe("up");
      }
    };

    // Wheel-Event for Desktop-Scrolling
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleWheel, handleSwipe]);

  // Bild geladen Callback
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => ({ ...prev, [imageUrl]: true }));
  };
  const handleImageError = (imageUrl: string) => {
    setLoadedImages((prev) => ({ ...prev, [imageUrl]: true }));
  };

  console.log("Events:", events);
  console.log("Current Index:", currentIndex);

  if (!events.length && isLoading) {
    return <div className="reel-container">Lade Events...</div>;
  }

  if (!events.length) {
    return <div className="reel-container">Keine Events verfügbar</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const renderLineup = (event: Event) => {
    if (!event.lineup || event.lineup.length === 0) {
      return (
        <div className="lineup-container" onClick={handleLineupClick}>
          <div className="lineup-content">
            <h2 className="lineup-title">Lineup</h2>
            <p className="no-lineup">no lineup</p>
          </div>
        </div>
      );
    }

    return (
      <div className="lineup-container" onClick={handleLineupClick}>
        <div className="lineup-content">
          <h2 className="lineup-title">Lineup</h2>
          <div className="artists-list">
            {event.lineup.map((artist, index) => (
              <div key={index} className="artist-item">
                <div className="artist-info-container">
                  <span className="artist-name">{artist.name}</span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      artist.name + " " + artist.role || " DJ"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linup-search-link"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                {artist.startTime && (
                  <span className="artist-time">{artist.startTime}</span>
                )}
                {artist.role && (
                  <span className="artist-role">{artist.role}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleLineupClick = () => {
    setShowLineup(!showLineup);
  };

  const renderReelItem = (event: Event, index: number) => {
    const imageUrl = event.imageUrl;
    const isLoaded = imageUrl ? loadedImages[imageUrl] : false;
    return (
      <div
        key={event.id}
        className="reel-item"
        style={{ top: `${index * 100}vh` }}
      >
        {/* Event Bild als Hintergrund */}
        <div
          className="reel-background-wrapper"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {imageUrl && (
            <>
              <img
                src={`https://img.event-scanner.com/insecure/rs:auto/plain/${imageUrl}@webp`}
                alt={event.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  opacity: isLoaded ? 1 : 0,
                  transition: "opacity 0.5s",
                }}
                onLoad={() => handleImageLoad(imageUrl)}
                onError={() => handleImageError(imageUrl)}
                draggable={false}
              />
              {!isLoaded && (
                <div className="reel-tile-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </>
          )}
          {!imageUrl && (
            <div
              className="reel-background"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          )}
        </div>
        {/* Overlay für bessere Lesbarkeit */}
        <div className="reel-overlay" />
        {/* Lineup Overlay */}
        {showLineup && renderLineup(event)}
        {/* Event Info */}
        <div className="reel-content">
          {/* Host Info oben */}
          <div className="reel-header">
            <div
              className="host-info"
              onClick={() => navigate(`/profile/${event.hostId}`)}
            >
              <div className="host-avatar">
                {event.host?.profileImageUrl ? (
                  <img
                    src={event.host.profileImageUrl}
                    alt={event.host.username}
                  />
                ) : (
                  <img src={DEFAULT_IMAGE} alt="Default Avatar" />
                )}
              </div>
              <span className="host-name">
                {event.host?.username || event.hostUsername || "Unknown"}
              </span>
            </div>
          </div>
          {/* Action Buttons rechts */}
          <div className="reel-actions">
            <button
              className={`action-btn like-btn ${
                isFavorite(event._id!) ? "liked" : ""
              }`}
              onClick={() => handleLike(event._id!)}
            >
              <Heart
                color={isFavorite(event._id!) ? "red" : "white"}
                fill={isFavorite(event._id!) ? "red" : "none"}
                size={32}
              />
            </button>

            <button className="action-btn">
              <MessageCircle size={32} />
            </button>

            <button className="action-btn">
              <Send size={32} />
            </button>
          </div>

          {/* Event Details unten */}
          <div className="reel-footer">
            <div className="reel-button-container">
              <button
                className="lineup-button"
                onClick={() => navigate(`/event/${event._id}`)}
                title="Lineup anzeigen"
              >
                <ChevronRight size={24} />
                <span>Details</span>
              </button>
              {/* Lineup Button for Desktop */}
              {event.lineup && event.lineup.length > 0 && (
                <button
                  className="lineup-button"
                  onClick={handleLineupClick}
                  title="Lineup anzeigen"
                >
                  <Clock size={24} />
                  <span>Lineup</span>
                </button>
              )}
            </div>
            <div className="event-info">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-date-facts">
                <p className="event-date">
                  in {getDaysUntilEvent(event.startDate)} days
                </p>
                <p className="event-views-reel">{event.views} views</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reel-container" ref={containerRef}>
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        className="reel-stack"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* All events are rendered, each at its position */}
        {events.map((event, index) => renderReelItem(event, index))}
      </div>

      {/* Loading indicator for more events */}
      {isLoading && (
        <div className="loading-more-indicator">Loading more events...</div>
      )}
    </div>
  );
};

export default ReelPage;
