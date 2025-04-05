import { Eye, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./EventCard.css";

export const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };
  return (
    <div
      onClick={() => {
        navigate(`/event/${event.id || event._id}`);
      }}
      className={`event-card-container card-${event.id}`}
    >
      <div className="event-card-image-container">
        <img
          className="event-card-image"
          src={event.imageUrl}
          alt={event.title}
        />
      </div>
      <div className="event-card-info-container">
        <span className="event-card-date">
          {formatDate(event.startDate as string)}
        </span>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-tags-real-list-item event-card-tags">
          {event.tags?.map((tag) => (
            <span key={tag} className="event-tag">
              {tag.toLowerCase()}
            </span>
          ))}
        </div>
        <div className="event-card-location-container">
          <MapPin size={16} />
          <p>{event.city || "TBA"}</p>
        </div>
        <div className="event-card-details">
          <div className="event-card-community-container">
            <div className="event-card-community-container-left">
              <div className="event-card-views-container">
                <Eye size={16} />
                <p>{event.views || 0}</p>
              </div>
              <div className="event-card-comments-container">
                <MessageCircle size={16} />
                <p>{event.commentCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
