import React from "react";
import { Event, getImageProxyUrl, getEventUrl } from "../../utils";
import "./EmbedGridCard.css";
import TicketButton from "../Buttons/TicketButton";

interface EmbedGridCardProps {
  event: Event;
}

export const EmbedGridCard: React.FC<EmbedGridCardProps> = ({
  event,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isToday = (eventDate: Date | string) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDateObj = new Date(eventDate);
    const eventDateStart = new Date(
      eventDateObj.getFullYear(),
      eventDateObj.getMonth(),
      eventDateObj.getDate()
    );
    return eventDateStart.getTime() === todayStart.getTime();
  };

  const handleEventClick = (event: Event) => {
    const eventUrl = getEventUrl(event);
    window.open(`https://event-scanner.com${eventUrl}`, "_blank");
  };

  const getTicketUrl = (): string => {
    if (event.ticketLink) {
      return event.ticketLink;
    }

    if (!event?.startDate) {
      return `https://www.google.com/search?q=${encodeURIComponent(event.title + " event tickets")}`;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDate = new Date(event.startDate);
    const formattedDate = formatDate(startDate);
    const searchQuery = `${event.title} ${formattedDate} event tickets`;
    
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const eventIsToday = isToday(event.startDate || new Date());

  return (
    <div
      className={`embed-grid-card ${eventIsToday ? "embed-grid-card-today" : ""}`}
      onClick={() => handleEventClick(event)}
    >
      <div className="embed-grid-card-image">
        <img
          src={getImageProxyUrl(event.imageUrl, 400, 247)}
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="embed-grid-card-content">
        {/* Title Section - High Visual Priority */}
        <h3 className="embed-grid-card-title">{event.title}</h3>
        
        {/* Secondary Information - Date & Time */}
        <div className="embed-grid-card-meta">
          <div className="embed-grid-card-date">
            {formatDate(event.startDate || new Date())}
            {event.startTime && ` • ${event.startTime}`}
          </div>
          {eventIsToday && (
            <span className="embed-grid-today-badge">TODAY</span>
          )}
        </div>
        
        {/* Description - Secondary Text (45-70 chars per line) */}
        {event.description && (
          <p className="embed-grid-card-description">
            {event.description.length > 120 
              ? `${event.description.substring(0, 120)}...` 
              : event.description}
          </p>
        )}
        
        {/* Primary Action - Clear Focus */}
        <div className="embed-grid-ticket-button-wrapper" onClick={(e) => e.stopPropagation()}>
          <TicketButton href={getTicketUrl()} />
        </div>
      </div>
    </div>
  );
};

