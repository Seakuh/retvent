import { Eye, Heart } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import "./TrendsListView.css";

interface TrendsListViewProps {
  event: Event;
  index: number;
  viewMode?: "list" | "compact";
  matchPercentage?: number;
}

export const TrendsListView: React.FC<TrendsListViewProps> = ({
  event,
  index,
  viewMode = "list",
  matchPercentage,
}) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useContext(UserContext);

  const handleEventClick = () => {
    navigate(`/event/${event.id || event._id}`);
  };

  const handleLike = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Verhindert das Navigieren zur Event-Detailseite

    const eventId = event.id || event._id;
    if (!eventId) return;

    if (isFavorite(eventId)) {
      // Nutze isFavorite statt lokalem State
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
    // setIsLiked nicht nötig, da wir isFavorite vom Context nutzen
  };

  const isCompact = viewMode === "compact";

  return (
    <div
      className={`trends-list-item ${isCompact ? "trends-list-item-compact" : ""}`}
      onClick={handleEventClick}
    >
      {/* Subtiler Hintergrund basierend auf matchPercentage */}
      {/* {matchPercentage !== undefined && (
        <div
          className="trends-list-match-background"
          style={{ width: `${matchPercentage}%` }}
        />
      )} */}

      {/* Nummerierung */}
      <div className="trends-list-number">{index + 1}</div>

      {/* Herz-Button als zweites Element */}
      <div
        onClick={handleLike}
        className="trends-list-heart-container"
      >
        <Heart
          size={20}
          color={isFavorite(event.id || event._id || "") ? "red" : "white"}
          fill={isFavorite(event.id || event._id || "") ? "red" : "none"}
        />
      </div>

      {/* Bild - nur im List-Modus */}
      {!isCompact && event.imageUrl && (
        <div className="trends-list-image-container">
          <img
            src={`https://img.event-scanner.com/insecure/rs:fit:200/q:70/plain/${event.imageUrl}@webp`}
            alt={event.title}
            className="trends-list-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Titel neben Bild, Host-Name und Views darunter */}
      <div className="trends-list-info">
        <h3 className="trends-list-event-title">{event.title}</h3>
        <div className="trends-list-meta">
          {(event.host?.username || event.hostUsername) && (
            <span className="trends-list-host">
              {event.host?.username || event.hostUsername}
            </span>
          )}
          {event.views !== undefined && (
            <span className="trends-list-views">
              <Eye size={14} />
              {event.views}
            </span>
          )}
          {matchPercentage !== undefined && (
            <span className="trends-list-match">
              {matchPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Datum rechts */}
      {event.startDate && (
        <div className="trends-list-date">
          {new Date(event.startDate).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
          })}
        </div>
      )}
    </div>
  );
};

