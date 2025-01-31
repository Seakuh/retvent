import React from 'react';
import { Event } from '../../types/event';
import { Calendar, MapPin, Tag, Heart, CalendarDays } from 'lucide-react';
import './EventList.css';

interface EventListProps {
  events: Event[];
  onToggleFavorite: (eventId: string) => void;
  favorites: Set<string>;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  onToggleFavorite, 
  favorites 
}) => {
  const addToCalendar = (event: Event) => {
    const startTime = new Date(event.date).toISOString();
    const endTime = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString();
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startTime.replace(/[-:]/g, '')}/${endTime.replace(/[-:]/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-card">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.name} className="event-image" />
          )}
          <div className="event-actions">
            <button 
              className={`action-button ${favorites.has(event.id) ? 'favorite' : ''}`}
              onClick={() => onToggleFavorite(event.id)}
            >
              <Heart fill={favorites.has(event.id) ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="action-button"
              onClick={() => addToCalendar(event)}
            >
              <CalendarDays />
            </button>
          </div>
          <div className="event-content">
            <h3 className="event-title">{event.name}</h3>
            <div className="event-details">
              <span className="event-detail">
                <Calendar size={16} />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="event-detail">
                <MapPin size={16} />
                {event.location}
              </span>
              {event.category && (
                <span className="event-detail">
                  <Tag size={16} />
                  {event.category}
                </span>
              )}
            </div>
            <p className="event-description">{event.description}</p>
            {event.price && <p className="event-price">{event.price}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};