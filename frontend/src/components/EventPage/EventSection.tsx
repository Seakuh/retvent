import { Event } from "../../utils";
import { EventCard } from "./EventCard";
import "./EventSection.css";
interface EventSectionProps {
  title: string;
  events: Event[];
}

export const EventSection = ({ title, events }: EventSectionProps) => {
  return (
    <>
      <h1 className="section-title">{title}</h1>
      <div className="event-list-container">
        {events.map((event) => (
          <div className="event-card-list-item" key={event.id + title}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </>
  );
};
