import { Event } from "../../utils";
import { EventCard } from "./EventCard";
import "./EventSection.css";
interface EventSectionProps {
  title: string;
  events: Event[];
}

export const EventSection = ({ title, events }: EventSectionProps) => {
  const emptyEvent = {
    id: "",
    title: "No events found",
    imageUrl:
      "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png",
    startDate: new Date(),
    description: "",
  };
  return (
    <>
      <h1 className="section-title">{title}</h1>
      <div className="event-list-container">
        {events.length === 0 ? (
          <div className="event-card-list-item">
            <EventCard event={emptyEvent} />
          </div>
        ) : (
          events.map((event) => (
            <div className="event-card-list-item" key={event.id + title}>
              <EventCard event={event} />
            </div>
          ))
        )}
      </div>
    </>
  );
};
