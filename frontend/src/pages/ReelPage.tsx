import {
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { DEFAULT_IMAGE, Event } from "../utils";
import "./ReelPage.css";
import { getReelEvents } from "./service";

const ReelPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<{ [key: string]: boolean }>({});
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getReelEvents(eventId);
      setEvents(events);
    };
    fetchEvents();
  }, [eventId]);

  // Hide swipe indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeIndicator(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSwipe = (direction: "up" | "down") => {
    if (isScrolling) return; // Verhindert zu schnelles Scrollen

    setIsScrolling(true);

    if (direction === "up" && currentIndex < events.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    // Debounce für Scroll-Events
    setTimeout(() => setIsScrolling(false), 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      handleSwipe("up");
    } else if (isDownSwipe) {
      handleSwipe("down");
    }
  };

  // Scroll-Handler für Desktop
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (isScrolling) return;

    if (e.deltaY > 0) {
      // Scroll nach unten = Event nach oben
      handleSwipe("up");
    } else {
      // Scroll nach oben = Event nach unten
      handleSwipe("down");
    }
  };

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

    // Wheel-Event für Desktop-Scrolling
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
  }, [currentIndex, isScrolling]);

  if (!events.length) {
    return <div className="reel-container">Keine Events verfügbar</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const renderReelItem = (event: Event, index: number) => {
    return (
      <div
        key={event.id}
        className="reel-item"
        style={{ top: `${index * 100}vh` }}
      >
        {/* Event Bild als Hintergrund */}
        <div
          className="reel-background"
          onClick={() => navigate(`/event/${event.id}`)}
          style={{
            backgroundImage: event.imageUrl
              ? `url(${event.imageUrl})`
              : "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Overlay für bessere Lesbarkeit */}
        <div className="reel-overlay" />

        {/* Event Info */}
        <div className="reel-content">
          {/* Host Info oben */}
          <div
            className="reel-header"
            onClick={() => navigate(`/profile/${event.hostId}`)}
          >
            <div className="host-info">
              <div className="host-avatar">
                {event.host?.profileImageUrl ? (
                  <img
                    src={event.host.profileImageUrl}
                    alt={event.host.username}
                  />
                ) : (
                  <img src={DEFAULT_IMAGE} alt={event.host.username} />
                )}
              </div>
              <span className="host-name">
                {event.host?.username || event.hostUsername || "Unknown"}
              </span>
            </div>
          </div>

          {/* Event Details unten */}
          <div className="reel-footer">
            <div className="event-info">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-date">
                in {getDaysUntilEvent(event.startDate)} Tagen
              </p>
            </div>
          </div>

          {/* Action Buttons rechts */}
          <div className="reel-actions">
            <button
              className={`action-btn like-btn ${
                isLiked[event.id || ""] ? "liked" : ""
              }`}
              onClick={() => handleLike(event.id || "")}
            >
              <Heart
                color={isFavorite(event.id!) ? "red" : "white"}
                fill={isFavorite(event.id!) ? "red" : "none"}
              />
            </button>

            <button className="action-btn">
              <MessageCircle size={28} />
              <span className="count">{event.commentCount || 0}</span>
            </button>

            <button className="action-btn">
              <Send size={28} />
            </button>

            <button className="action-btn">
              <MoreVertical size={28} />
            </button>
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
        {/* Alle Events werden gerendert, jedes an seiner Position */}
        {events.map((event, index) => renderReelItem(event, index))}
      </div>
    </div>
  );
};

export default ReelPage;
