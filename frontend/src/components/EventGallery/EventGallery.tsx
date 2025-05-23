import React from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../types/event";
import "./EventGallery.css";

const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventGalleryProps {
  events: Event[];
  favorites: Set<string>;
  onToggleFavorite: (eventId: string) => void;
}

export const EventGallery: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="section-title">{title}</div>
      <div className="gallery-grid">
        {events.map((event) => (
          <div
            key={event.id}
            className={`image-card`}
            onClick={() => navigate(`/event/${event.id || event._id}`)}
          >
            <img
              src={event.imageUrl || DEFAULT_IMAGE}
              alt={event.title}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </>
  );
};
