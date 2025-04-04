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
          <span className="location">
            <MapPin size={16} />
            {event.city || "TBA"}
          </span>
        </div>
      </div>
    </div>
  );
};
