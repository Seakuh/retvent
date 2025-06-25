import {
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreVertical,
  Send,
  User2,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { Event } from "../utils";
import "./ReelPage.css";
import { getReelEvents } from "./service";

const ReelPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<{ [key: string]: boolean }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getReelEvents(eventId);
      setEvents(events);
    };
    fetchEvents();
  }, [eventId]);

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < events.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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

  const currentEvent = events[currentIndex];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handleSwipe("up");
      } else if (e.key === "ArrowDown") {
        handleSwipe("down");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex]);

  if (!currentEvent) {
    return <div className="reel-container">Keine Events verfügbar</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="reel-container" ref={containerRef}>
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <div className="reel-video-container">
        {/* Event Bild als Hintergrund */}
        <div
          className="reel-background"
          style={{
            backgroundImage: currentEvent.imageUrl
              ? `url(${currentEvent.imageUrl})`
              : "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          }}
        />

        {/* Overlay für bessere Lesbarkeit */}
        <div className="reel-overlay" />

        {/* Event Info */}
        <div className="reel-content">
          {/* Host Info oben */}
          <div className="reel-header">
            <div className="host-info">
              <div className="host-avatar">
                {currentEvent.host?.profileImageUrl ? (
                  <img
                    src={currentEvent.host.profileImageUrl}
                    alt={currentEvent.host.username}
                  />
                ) : (
                  <User2 size={40} />
                )}
              </div>
              <span className="host-name">
                {currentEvent.host?.username ||
                  currentEvent.hostUsername ||
                  "Unknown"}
              </span>
            </div>
          </div>

          {/* Event Details unten */}
          <div className="reel-footer">
            <div className="event-info">
              <h3 className="event-title">{currentEvent.title}</h3>
              <p className="event-date">
                in {getDaysUntilEvent(currentEvent.startDate)} Tagen
              </p>
            </div>
          </div>

          {/* Action Buttons rechts */}
          <div className="reel-actions">
            <button
              className={`action-btn like-btn ${
                isLiked[currentEvent.id || ""] ? "liked" : ""
              }`}
              onClick={() => handleLike(currentEvent.id || "")}
            >
              <Heart
                color={isFavorite(currentEvent.id!) ? "red" : "white"}
                fill={isFavorite(currentEvent.id!) ? "red" : "none"}
              />
            </button>

            <button className="action-btn">
              <MessageCircle size={28} />
              <span className="count">{currentEvent.commentCount || 0}</span>
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
    </div>
  );
};

export default ReelPage;
