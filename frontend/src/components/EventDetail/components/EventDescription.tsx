import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import "./EventDescription.css";
interface EventDescriptionProps {
  title: string;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="event-description-container">
      <div
        className={`event-description-section ${
          expanded ? "expanded" : "collapsed"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="event-description-text">{description}</div>
        {expanded ? (
          <div className="expand-hint">
            <ChevronUp className="more-info-icon h-5 w-5" />
          </div>
        ) : (
          <div className="expand-hint">
            <ChevronDown className="more-info-icon h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};
