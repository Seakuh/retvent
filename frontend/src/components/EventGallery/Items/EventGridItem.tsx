import { Event } from "../../../utils";
import "./EventGridItem.css";

interface EventGridItemProps {
  event: Event;
  handleEventClick: (id: string) => void;
  isPast?: boolean;
}

export const EventGridItem: React.FC<EventGridItemProps> = ({
  event,
  handleEventClick,
  isPast = false,
}) => {
  return (
    <a
      key={event.id}
      onClick={() => handleEventClick(event.id || event._id || "")}
      className={`event-grid-item ${isPast ? "past" : ""}`}
    >
      <div className="event-grid-item-image">
        <img
          src={`https://img.event-scanner.com/insecure/q:70/plain/${event.imageUrl}@webp`}
          alt={event.title}
          loading="lazy"
        />
      </div>
      {/* <div className="event-grid-item-info">
        <h2>{event.title}</h2>
      </div> */}
    </a>
  );
};
