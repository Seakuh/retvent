import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./EventGalleryIII.css";
import { EventGridItem } from "./Items/EventGridItem";

interface EventGalleryProps {
  events: Event[];
  title: string;
}

export const EventGalleryIII: React.FC<EventGalleryProps> = ({ events }) => {
  const navigate = useNavigate();
  const sortAndGroupEvents = (events: Event[]) => {
    const today = new Date();

    // Sort events by date
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.startDate as string);
      const dateB = new Date(b.startDate as string);
      return dateA.getTime() - dateB.getTime();
    });

    // Past events (before today)
    const pastEvents = sortedEvents.filter((event) => {
      const eventDate = new Date(event.startDate as string);
      return eventDate < today;
    });

    // Upcoming events (from today onwards)
    const upcomingEvents = sortedEvents.filter((event) => {
      const eventDate = new Date(event.startDate as string);
      return eventDate >= today;
    });

    const nextEventDays =
      upcomingEvents.length > 0
        ? Math.ceil(
            (new Date(upcomingEvents[0].startDate as string).getTime() -
              today.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

    return {
      ...(upcomingEvents.length > 0 && {
        upcoming: { events: upcomingEvents, days: nextEventDays },
      }),
      ...(pastEvents.length > 0 && { past: pastEvents }),
    };
  };

  const handleEventClick = (eventId: string) => {
    // Navigation zur Event-Detailseite
    navigate(`/event/${eventId}`);
  };

  const groupedEvents = sortAndGroupEvents(events);

  return (
    <div className="event-gallery-container">
      {/* <h2 className="section-title">{title}</h2> */}
      {Object.entries(groupedEvents).map(([section, sectionData]) => (
        <div key={section} className="event-section">
          <h2
            className={`event-section-title ${
              section === "past" ? "past-title" : ""
            }`}
          >
            {section === "upcoming" && (
              <span className="event-section-next-title-text">
                Next{" "}
                <span className="days-until">
                  in {(sectionData as { days: number }).days} days
                </span>
              </span>
            )}
            {section === "past" && "Past Events"}
          </h2>
          <div className="event-grid-gallery">
            {(section === "upcoming"
              ? (sectionData as { events: Event[] }).events
              : (sectionData as Event[])
            ).map((event) => (
              <EventGridItem
                key={event.id}
                event={event}
                handleEventClick={handleEventClick}
                isPast={section === "past"}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventGalleryIII;
