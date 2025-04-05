import { MessageCircle } from "lucide-react";

import { MapPin } from "lucide-react";

import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_IMAGE, Event, formatDate } from "../../../utils";
import "./RealListItem.css";

export const RealListItem: React.FC<{ event: Event; isPast?: boolean }> = ({
  event,
  isPast,
}) => {
  const navigate = useNavigate();
  console.log("event", event);
  return (
    <div
      key={event.id || event._id}
      className={`real-event-list-item ${isPast ? "past-event" : ""}`}
      onClick={() => navigate(`/event/${event.id || event._id}`)}
    >
      <div className="real-event-thumbnail">
        <img
          src={event.imageUrl || DEFAULT_IMAGE}
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="miniature-event-info">
        <h2 className="event-info-date">
          {formatDate(event.startDate as string)}
        </h2>
        <h1 className="event-info-title-headline">{event.title}</h1>
        <div className="event-tags-real-list-item">
          {event.tags?.map((tag) => (
            <span key={tag} className="event-tag">
              {tag.toLowerCase()}
            </span>
          ))}
        </div>
        <span className="real-list-item-location">
          <MapPin size={16} />
          {event.city || "TBA"}
        </span>
        <div className="event-meta-container">
          <div className="event-meta-container-right">
            <span className="views">
              <Eye size={16} />
              {event.views}
            </span>
            <span className="comments">
              <MessageCircle size={16} />
              {event.commentCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
