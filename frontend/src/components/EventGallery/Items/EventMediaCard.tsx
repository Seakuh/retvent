import { MessageCircle } from "lucide-react";

import { MapPin } from "lucide-react";

import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../../utils";
import "./EventMediaCard.css";

export const EventMediaCard: React.FC<{ event: Event; isPast?: boolean }> = ({
  event,
  isPast,
}) => {
  const navigate = useNavigate();
  return (
    <div
      key={event.id || event._id}
      className={`event-media-card ${isPast ? "past-event" : ""}`}
      onClick={() => navigate(`/event/${event.id || event._id}`)}
    >
      <div className="event-media-card-profile-section">
        <div className="event-media-card-profile-section-left">
          <div className="event-media-card-profile-section-left-image">
            <img
              className="event-media-card-profile-image"
              src={`https://img.event-scanner.com/insecure/rs:fill:500:281/q:70/plain/${event.imageUrl}@webp`}
              alt={event.title}
              loading="lazy"
              decoding="async"
            />
            <h1 className="event-media-card-host-name">{event.hostUsername}</h1>
          </div>
        </div>
      </div>
      <div className="event-media-card-thumbnail">
        <img
          src={`https://img.event-scanner.com/insecure/rs:fill:500:281/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="event-media-card-meta-container">
        <div className="event-media-card-meta-container-right">
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
      <div className="event-media-card-info">
        <h1 className="event-media-card-title">{event.title}</h1>
        <h2 className="event-media-card-description">{event.description}</h2>
        {/* <div className="event-media-card-tags">
          {event.tags?.map((tag) => (
            <span key={tag} className="event-media-card-tag">
              {tag.toLowerCase()}
            </span>
          ))}
        </div> */}
        <span className="event-media-card-location">
          <MapPin size={16} />
          {event.city || "TBA"}
        </span>
      </div>
    </div>
  );
};
