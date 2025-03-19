import { Event } from "../../utils";
import { EventCard } from "./EventCard";
import "./EventSection.css";
interface EventSectionProps {
  title: string;
  events: Event[];
}

const blankEvent: Event = {
  id: "",
  title: "No events found",
  startDate: new Date(),
  description: "N/A",
  imageUrl:
    "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png",
};

export const EventSection = ({ title, events }: EventSectionProps) => {
  return (
    <>
      <h1 className="section-title">{title}</h1>
      <div className="event-list-container">
        {events.length === 0 ? (
          <div className="no-events-container">
            <EventCard event={blankEvent} />
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
