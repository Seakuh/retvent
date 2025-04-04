import { Eye, MapPin, MessageCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Event, emptyEvent, formatDate } from "../../utils";
import "./EventGalleryII.css";
import { RealListItem } from "./Items/RealListItem";
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
      key={event.id || event._id}
      className={`event-list-item ${isPast ? "past-event" : ""}`}
      onClick={() => navigate(`/event/${event.id || event._id}`)}
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
          <div className="event-meta-container-right">
            <span className="views">
              <Eye size={16} />
              {event.views}
            </span>
            <span className="comments">
              <MessageCircle size={16} />
              {event.commentCount}
            </span>
          </div>
          <span className="location">
            <MapPin size={16} />
            {event.city || "TBA"}
          </span>
        </div>
      </div>
    </div>
  );

  const getDaysUntilDate = (date: string | Date): number => {
    // Parse das Datum-Format "SAT, JUL 12"
    const [, month, day] = date.toString().split(/[,\s]+/);
    const currentYear = new Date().getFullYear();

    // Erstelle neues Datum mit aktuellem Jahr
    const eventDate = new Date(`${month} ${day} ${currentYear}`);
    const now = new Date();

    // Beide Daten auf Mitternacht des jeweiligen Tages setzen
    const eventDateOnly = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const nowDateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const timeDiff = eventDateOnly.getTime() - nowDateOnly.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };

  const getDaysPast = (date: string | Date): number => {
    const eventDate = new Date(date);
    const now = new Date();
    const timeDiff = now.getTime() - eventDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  function getHoursUntilStart(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    return Math.abs(Math.ceil(diff / (1000 * 60 * 60)));
  }

  return (
    <>
      {/* <h1 className="section-title">{title}</h1> */}
      {todayEvents.length > 0 && (
        <div>
          <div className="event-date-section">
            <div className="event-date-heading-container">
              <h2 className="section-title">Today</h2>
              <h3 className="event-date-heading-sub">
                in {getHoursUntilStart(todayEvents[0].startDate as string)}{" "}
                hours
              </h3>
            </div>
            <div className="real-event-list-item-container">
              {todayEvents.map((event) => (
                <RealListItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="event-list">
        {Object.keys(groupedUpcomingEvents).length > 0 ? (
          <>
            {Object.entries(groupedUpcomingEvents).map(
              ([date, eventsForDate]) => (
                <div key={date} className="event-date-section">
                  <div className="event-date-heading-container">
                    <h2 className="section-title">{date}</h2>
                    <h3 className="event-date-heading-sub">
                      {getDaysUntilDate(date) === 1
                        ? "tomorrow"
                        : `in ${getDaysUntilDate(date)} days`}
                    </h3>
                  </div>
                  <br />
                  {eventsForDate.map((event) => (
                    <RealListItem key={event.id} event={event} />
                  ))}
                </div>
              )
            )}
          </>
        ) : (
          <RealListItem event={emptyEvent} />
        )}
      </div>
      {/* Past Events */}
      <h2 className="section-title past-events-title">Past</h2>
      <h3 className="event-date-heading-sub"></h3>
      <div className="event-list">
        {Object.keys(groupedPastEvents).length > 0 && (
          <>
            {Object.entries(groupedPastEvents).map(([date, eventsForDate]) => (
              <div key={date} className="event-date-section">
                <h2 className="section-title">{date}</h2>
                <br />
                {eventsForDate.map((event) => (
                  <RealListItem key={event.id} event={event} isPast={true} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};
