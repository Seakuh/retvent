import { Check, X } from "lucide-react";
import { useState } from "react";
import { Event } from "../../utils";
import "./EventRSVP.css";

interface EventRSVPProps {
  event: Event;
  userId?: string;
  attendees?: string[];
  notAttending?: string[];
  onRSVP: (eventId: string, status: "yes" | "no") => void;
}

export const EventRSVP: React.FC<EventRSVPProps> = ({
  event,
  userId,
  attendees = [],
  notAttending = [],
  onRSVP,
}) => {
  const [localStatus, setLocalStatus] = useState<"yes" | "no" | null>(
    attendees.includes(userId || "")
      ? "yes"
      : notAttending.includes(userId || "")
      ? "no"
      : null
  );

  const handleRSVP = (status: "yes" | "no") => {
    if (!userId) return;
    setLocalStatus(status);
    onRSVP(event.id || event._id || "", status);
  };

  return (
    <div className="event-rsvp">
      <div className="event-rsvp-image">
        <img
          src={`https://img.event-scanner.com/insecure/rs:fill:400:400/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
          loading="lazy"
        />
      </div>

      <div className="event-rsvp-info">
        <h3 className="event-rsvp-title">{event.title}</h3>
        {event.startDate && (
          <p className="event-rsvp-date">
            {new Date(event.startDate).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        )}

        <div className="event-rsvp-actions">
          <button
            className={`event-rsvp-btn yes ${
              localStatus === "yes" ? "active" : ""
            }`}
            onClick={() => handleRSVP("yes")}
            disabled={!userId}
          >
            <Check size={16} />
            Going ({attendees.length})
          </button>
          <button
            className={`event-rsvp-btn no ${
              localStatus === "no" ? "active" : ""
            }`}
            onClick={() => handleRSVP("no")}
            disabled={!userId}
          >
            <X size={16} />
            Not Going ({notAttending.length})
          </button>
        </div>
      </div>
    </div>
  );
};
