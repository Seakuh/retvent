import React from "react";
import "./TicketLinkButton.css";
import { Ticket } from "lucide-react";
interface TicketLinkButtonProps {
  href: string;
}

export const TicketLinkButton: React.FC<TicketLinkButtonProps> = ({ href }) => {

  const handleClick = () => {
    window.open(href, "_blank");
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