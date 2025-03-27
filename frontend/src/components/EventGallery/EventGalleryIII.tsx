import { Event } from "../../utils";
import { EventListItem } from "./EventListItem";

interface EventGalleryProps {
  events: Event[];
  title: string;
}

export const EventGalleryIII: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  return (
    <div className="event-gallery-container">
      <h2 className="section-title">{title}</h2>
      <div className="event-list">
        {events.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
