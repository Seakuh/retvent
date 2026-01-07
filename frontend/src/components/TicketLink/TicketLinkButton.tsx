import React from "react";
import "./TicketLinkButton.css";
import { Ticket } from "lucide-react";
import { Event } from "../../utils";

interface TicketLinkButtonProps {
  event: Event;
}

export const TicketLinkButton: React.FC<TicketLinkButtonProps> = ({ event }) => {
  const handleClick = () => {
    // Wenn ticketLink vorhanden ist, diesen öffnen
    if (event.ticketLink) {
      window.open(event.ticketLink, "_blank");
      return;
    }

    // Ansonsten Google-Suche mit Event-Titel und Startdatum
    if (!event?.startDate) return;

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = new Date(event.startDate);
    const formattedDate = formatDate(startDate);
    
    const searchQuery = `${event.title} ${formattedDate} event tickets`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    window.open(googleSearchUrl, "_blank");
  };

  return (
    <div className="ticket-link-button-container" onClick={handleClick}>
      <div className="ticket-link-icon">
        <Ticket className="ticket-icon" />
      </div>
      <span className="ticket-link-text">Get Tickets Now</span>
    </div>
  );
};