import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./EventGalleryIII.css";
import { EventGridItem } from "./Items/EventGridItem";

interface EventGalleryProps {
  events: Event[];
  title: string;
}

export const EventGalleryIII: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  const navigate = useNavigate();
  const sortAndGroupEvents = (events: Event[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sortiere Events nach Datum
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.startDate as string);
      const dateB = new Date(b.startDate as string);
      return dateA.getTime() - dateB.getTime();
    });

    const todayEvents = sortedEvents.filter((event) =>
      isSameDay(new Date(event.startDate as string), today)
    );
    const tomorrowEvents = sortedEvents.filter((event) =>
      isSameDay(new Date(event.startDate as string), tomorrow)
    );
    const futureEvents = sortedEvents.filter((event) => {
      const eventDate = new Date(event.startDate as string);
      return (
        eventDate > tomorrow &&
        !todayEvents.includes(event) &&
        !tomorrowEvents.includes(event)
      );
    });

    // Berechne die Tage bis zum Event für die Überschrift
    const futureWithDays = futureEvents.map((event) => {
      const eventDate = new Date(event.startDate as string);
      const daysUntil = Math.ceil(
        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...event, daysUntil };
    });

    return {
      ...(todayEvents.length > 0 && { today: todayEvents }),
      ...(tomorrowEvents.length > 0 && { tomorrow: tomorrowEvents }),
      ...(futureEvents.length > 0 && { upcoming: futureWithDays }),
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
      {Object.entries(groupedEvents).map(([section, sectionEvents]) => (
        <div key={section} className="event-section">
          <h2 className="event-section-title">{section}</h2>
          <div className="event-grid-gallery">
            {(section === "upcoming"
              ? (sectionEvents as (Event & { daysUntil: number })[])
              : sectionEvents
            ).map((event) => (
              <EventGridItem
                key={event.id}
                event={event}
                handleEventClick={handleEventClick}
                daysUntil={
                  section === "upcoming"
                    ? `in ${(event as any).daysUntil} Tagen`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Hilfsfunktionen
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isThisWeek = (date: Date) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return date >= weekStart && date <= weekEnd;
};

export default EventGalleryIII;
