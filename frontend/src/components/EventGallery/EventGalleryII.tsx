import { Eye, MapPin } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Event, formatDate } from "../../utils";
import "./EventGalleryII.css";

const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventGalleryProps {
  events: Event[];
  title: string;
}

export const EventGalleryII: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  const navigate = useNavigate();

  // Sortiere Events nach Startdatum (aufsteigend)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Gruppiere Events nach Datum
  const groupedEvents: Record<string, Event[]> = sortedEvents.reduce(
    (acc, event) => {
      const eventDate = formatDate(event.startDate as string);
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push(event);
      return acc;
    },
    {} as Record<string, Event[]>
  );

  return (
    <>
      {/* <h1 className="section-title">{title}</h1> */}
      <div className="event-list">
        {Object.entries(groupedEvents).map(([date, eventsForDate]) => (
          <div key={date} className="event-date-section">
            <h2 className="event-date-heading">{date}</h2>
            <br />
            {eventsForDate.map((event) => (
              <div
                key={event.id}
                className="event-list-item"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="event-thumbnail">
                  <img
                    src={event.imageUrl || DEFAULT_IMAGE}
                    alt={event.title}
                    loading="lazy"
                  />
                </div>
                <div className="event-info">
                  <h2 className="event-info-date">
                    {formatDate(event.startDate as string)}
                  </h2>
                  <h1 className="event-info-title-headline">{event.title}</h1>
                  <div className="event-meta-container">
                    <span className="location">
                      <MapPin size={16} />
                      {event.city || "TBA"}
                    </span>
                    <span className="views">
                      <Eye size={16} />
                      {event.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
