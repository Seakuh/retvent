import { Event } from "../../../utils";
import "./EventGridItem.css";

interface EventGridItemProps {
  event: Event;
  handleEventClick: (id: string) => void;
  isPast?: boolean;
}

/**
 * EventGridItem Component
 *
 * Displays a single event in a grid layout
 * Optimized for performance with lazy loading and responsive images
 */
export const EventGridItem: React.FC<EventGridItemProps> = ({
  event,
  handleEventClick,
  isPast = false,
}) => {
  return (
    <a
      key={event.id || event._id}
      onClick={() => handleEventClick(event.id || event._id || "")}
      className={`event-grid-item ${isPast ? "past" : ""}`}
    >
      <div className="event-grid-item-image">
        <img
          src={`https://img.event-scanner.com/insecure/rs:fill:400:400/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
          loading="lazy"
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add("loaded")}
        />
      </div>
      {/* <div className="event-grid-item-info">
        <h2>{event.title}</h2>
      </div> */}
    </a>
  );
};
