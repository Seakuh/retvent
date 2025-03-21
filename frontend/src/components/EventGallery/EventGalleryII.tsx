import { Eye, MapPin } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Event, emptyEvent, formatDate } from "../../utils";
import "./EventGalleryII.css";

const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventGalleryProps {
  events: Event[];
  title: string;
}

export const EventGalleryII: React.FC<EventGalleryProps> = ({
  events,
  title,
}) => {
  const navigate = useNavigate();

  // Optimierte Sortierung und Filterung in einem Durchlauf
  const { upcomingEvents, todayEvents, pastEvents } = events.reduce(
    (acc, event) => {
      if (!event.startDate) return acc;
      const startDate = new Date(event.startDate);
      const now = new Date();

      // Setze Uhrzeiten auf Mitternacht für Datumsvergleich
      const startDateOnly = new Date(startDate.setHours(0, 0, 0, 0));
      const nowDateOnly = new Date(now.setHours(0, 0, 0, 0));

      if (startDateOnly.getTime() === nowDateOnly.getTime()) {
        acc.todayEvents.push(event);
      } else if (startDate > now) {
        acc.upcomingEvents.push(event);
      } else {
        acc.pastEvents.push(event);
      }
      return acc;
    },
    {
      upcomingEvents: [] as Event[],
      todayEvents: [] as Event[],
      pastEvents: [] as Event[],
    }
  );

  // Sortiere die Events nach Datum
  upcomingEvents.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  pastEvents.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  ); // Absteigend für Past Events

  // Gruppiere Events nach Datum
  const groupEvents = (events: Event[]): Record<string, Event[]> => {
    return events.reduce((acc, event) => {
      const eventDate = formatDate(event.startDate as string);
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  };

  const groupedUpcomingEvents = groupEvents(upcomingEvents);
  const groupedPastEvents = groupEvents(pastEvents);

  const EventListItem: React.FC<{ event: Event; isPast?: boolean }> = ({
    event,
    isPast,
  }) => (
    <div
      key={event.id}
      className={`event-list-item ${isPast ? "past-event" : ""}`}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="event-thumbnail">
        <img
          src={event.imageUrl || DEFAULT_IMAGE}
          alt={event.title}
          loading="lazy"
        />
      </div>
      <div className="miniature-event-info">
        <h2 className="event-info-date">
          {formatDate(event.startDate as string)}
        </h2>
        <h1 className="event-info-title-headline">{event.title}</h1>
        <div className="event-meta-container">
          <span className="location">
            <MapPin size={16} />
            {event.city || "TBA"}
          </span>
          <span className="views">
            <Eye size={16} />
            {event.views}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* <h1 className="section-title">{title}</h1> */}
      {todayEvents.length > 0 && (
        <>
          <h2 className="section-title">Today</h2>
          <div className="event-list">
            <div className="event-date-section">
              {todayEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        </>
      )}
      <h2 className="section-title">Upcoming</h2>
      <div className="event-list">
        {Object.keys(groupedUpcomingEvents).length > 0 ? (
          <>
            {Object.entries(groupedUpcomingEvents).map(
              ([date, eventsForDate]) => (
                <div key={date} className="event-date-section">
                  <h2 className="event-date-heading">{date}</h2>
                  <br />
                  {eventsForDate.map((event) => (
                    <EventListItem key={event.id} event={event} />
                  ))}
                </div>
              )
            )}
          </>
        ) : (
          <EventListItem event={emptyEvent} />
        )}
      </div>
      {/* Past Events */}
      <h2 className="section-title">Past</h2>
      <div className="event-list">
        {Object.keys(groupedPastEvents).length > 0 && (
          <>
            {Object.entries(groupedPastEvents).map(([date, eventsForDate]) => (
              <div key={date} className="event-date-section">
                <h2 className="event-date-heading">{date}</h2>
                <br />
                {eventsForDate.map((event) => (
                  <EventListItem key={event.id} event={event} isPast={true} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};
