import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./TrendsListView.css";

interface TrendsListViewProps {
  event: Event;
  index: number;
  viewMode?: "list" | "compact";
}

export const TrendsListView: React.FC<TrendsListViewProps> = ({
  event,
  index,
  viewMode = "list",
}) => {
  const navigate = useNavigate();

  const handleEventClick = () => {
    navigate(`/event/${event.id || event._id}`);
  };

  const isCompact = viewMode === "compact";

  return (
    <div
      className={`trends-list-item ${isCompact ? "trends-list-item-compact" : ""}`}
      onClick={handleEventClick}
    >
      {/* Nummerierung ganz links */}
      <div className="trends-list-number">{index + 1}</div>

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
        </div>
      </div>

      {/* Datum ganz rechts */}
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

