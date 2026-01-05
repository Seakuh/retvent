import { Event } from "../../utils";
import "./EventSection.css";
import { TrendsListView } from "./TrendsListView";

interface EventSectionProps {
  title?: string;
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
}

export const EventSection = ({ title, events }: EventSectionProps) => {
  return (
    <>
      {events.length === 0 ? (
        <></>
      ) : (
        <>
          <h2 className="popular-title">{title}</h2>
          <div className="event-list-container">
            {events.map((event, index) => (
              <div
                className="event-card-list-item"
                key={event.id || event._id}
              >
                <TrendsListView event={event} index={index} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
