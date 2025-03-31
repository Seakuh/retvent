import { Event } from "../../../utils";
import "./EventGridItem.css";
interface EventGridItemProps {
  event: Event;
  handleEventClick: (eventId: string) => void;
}

export const EventGridItem = ({
  event,
  handleEventClick,
}: EventGridItemProps) => {
  return (
    <a
      key={event.id}
      onClick={() => handleEventClick(event.id || "")}
      className="event-grid-item"
    >
      <div className="event-grid-item-image">
        <img src={event.imageUrl} alt={event.title} />
      </div>
      {/* <div className="event-grid-item-info">
        <h2>{event.title}</h2>
      </div> */}
    </a>
  );
};
