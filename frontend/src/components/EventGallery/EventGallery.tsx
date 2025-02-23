import React from 'react';
import { Event } from '../../types/event';
import { useNavigate } from 'react-router-dom';
import './EventGallery.css';

interface EventGalleryProps {
  events: Event[];
  favorites: Set<string>;
  onToggleFavorite: (eventId: string) => void;
}

export const EventGallery: React.FC<EventGalleryProps> = ({ events }) => {
  const navigate = useNavigate();

  return (
    <div className="gallery-grid">
      {events.map((event) => (
        <div
          key={event.id}
          className="image-card"
          onClick={() => navigate(`/event/${event.id}`)}
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}; 