import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../types/event";
import { getEventUrl } from "../../utils";
import "./EventGallery.css";

const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventGalleryProps {
  events: Event[];
  favorites?: Set<string>;
  onToggleFavorite?: (eventId: string) => void;
  title?: string;
}

export const EventGallery: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  const navigate = useNavigate();

  // Group events by date
  const eventsByDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const grouped = new Map<string, { label: string; events: Event[] }>();

    events.forEach((event) => {
      if (!event.startDate) return;

      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      const dateKey = eventDate.toISOString().split("T")[0];

      let label: string;
      if (eventDate.getTime() === today.getTime()) {
        label = "Today";
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        label = "Tomorrow";
      } else {
        label = eventDate.toLocaleDateString("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      }

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { label, events: [] });
      }
      grouped.get(dateKey)!.events.push(event);
    });

    // Sort by date
    const sortedEntries = Array.from(grouped.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedEntries;
  }, [events]);

  return (
    <div className="gallery-container">
      {title && <div className="section-title">{title}</div>}
      {eventsByDate.map(([dateKey, { label, events: dateEvents }]) => (
        <div key={dateKey} className="gallery-date-section">
          <div className="gallery-date-header">{label}</div>
          <div className="gallery-row">
            {dateEvents.map((event) => (
              <div
                key={event.id}
                className="image-card"
                onClick={() => navigate(getEventUrl(event))}
              >
                <img
                  src={event.imageUrl || DEFAULT_IMAGE}
                  alt={event.title}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
