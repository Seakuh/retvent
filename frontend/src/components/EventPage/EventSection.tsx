import { Event } from "../../utils";
interface EventSectionProps {
  title: string;
  events: Event[];
}

export const EventSection = ({ title, events }: EventSectionProps) => {
  return (
    <>
      <h1 className="section-title">{title}</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </>
  );
};
