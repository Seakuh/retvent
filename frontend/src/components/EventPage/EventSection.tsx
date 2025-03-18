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
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id + title}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </>
  );
};
