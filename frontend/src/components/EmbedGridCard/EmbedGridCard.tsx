import React from "react";
import { Event, getImageProxyUrl } from "../../utils";
import { Ticket } from "lucide-react";
import "./EmbedGridCard.css";

interface EmbedGridCardProps {
  event: Event;
  secondaryColor?: string;
}

export const EmbedGridCard: React.FC<EmbedGridCardProps> = ({
  event,
  secondaryColor = "#000000",
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

  const handleEventClick = (eventId: string) => {
    const mainSiteUrl = "https://event-scanner.com/";
    window.open(`${mainSiteUrl}event/${eventId}`, "_blank");
  };

  const handleTicketClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (event.ticketLink) {
      window.open(event.ticketLink, "_blank");
      return;
    }

    if (!event?.startDate) return;

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDate = new Date(event.startDate);
    const formattedDate = formatDate(startDate);

    const searchQuery = `${event.title} ${formattedDate} event tickets`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    window.open(googleSearchUrl, "_blank");
  };

  const eventIsToday = isToday(event.startDate || new Date());

  return (
    <div
      className={`embed-grid-card ${eventIsToday ? "embed-grid-card-today" : ""}`}
      onClick={() => handleEventClick(event.id || event._id || "")}
      style={{ backgroundColor: secondaryColor }}
    >
      <div className="embed-grid-card-image">
        <img
          src={getImageProxyUrl(event.imageUrl, 400, 247)}
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="embed-grid-card-content">
        <h3 className="embed-grid-card-title">{event.title}</h3>
        <div className="embed-grid-card-date">
          {formatDate(event.startDate || new Date())}
          {event.startTime && ` • ${event.startTime}`}
          {eventIsToday && <span className="embed-grid-today-label"> • TODAY</span>}
        </div>
        <div className="embed-grid-ticket-button-container" onClick={handleTicketClick}>
          <div className="embed-grid-ticket-icon">
            <Ticket className="embed-grid-ticket-icon-svg" />
          </div>
          <span className="embed-grid-ticket-text">Get Tickets Now</span>
        </div>
      </div>
    </div>
  );
};

