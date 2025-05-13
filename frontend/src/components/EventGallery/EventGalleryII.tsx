import React from "react";
import { Event, formatDate, getDaysPast, getDaysUntilDate } from "../../utils";
import "./EventGalleryII.css";
import { RealListItem } from "./Items/RealListItem";

const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

interface EventGalleryProps {
  events: Event[];
}

export const EventGalleryII: React.FC<EventGalleryProps> = ({ events }) => {
  const getEventId = (event: Event) => event.id || event._id;

  // Setze einmal aktuelle Mitternachts-Zeit
  const now = new Date();
  const nowDateOnly = new Date(now.setHours(0, 0, 0, 0));

  // Sortiere und filtere Events in einem Schritt
  const { upcomingEvents, todayEvents, pastEvents } = events.reduce(
    (acc, event) => {
      if (!event.startDate) return acc;

      const startDate = new Date(event.startDate);
      const startDateOnly = new Date(startDate.setHours(0, 0, 0, 0));

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

  // Sortiere Events
  upcomingEvents.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  pastEvents.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Gruppiere Events nach Datum
  const groupEventsByDate = (events: Event[]): Record<string, Event[]> => {
    return events.reduce((acc, event) => {
      const eventDate = formatDate(event.startDate as string);
      if (!acc[eventDate]) acc[eventDate] = [];
      acc[eventDate].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  };

  const groupedUpcomingEvents = groupEventsByDate(upcomingEvents);
  const groupedPastEvents = groupEventsByDate(pastEvents);

  return (
    <div className="event-gallery-container">
      {/* Today Section */}
      <div className="event-date-heading-container">
        <h2 className="section-title">Today</h2>
      </div>
      {todayEvents.length > 0 && (
        <div className="event-date-section">
          <div className="event-date-heading-container">
            {/* <h3 className="event-date-heading-sub">
              {(() => {
                const hoursUntilStart = getHoursUntilStart(
                  todayEvents[0].startDate as string
                );
                return hoursUntilStart < 0
                  ? `started ${Math.abs(hoursUntilStart)} hours ago`
                  : `in ${hoursUntilStart} hours`;
              })()}
            </h3> */}
          </div>
          <div className="real-event-list-item-container">
            {todayEvents.map((event) => (
              <RealListItem key={getEventId(event)} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      <div className="event-list">
        {Object.keys(groupedUpcomingEvents).length > 0 &&
          Object.entries(groupedUpcomingEvents).map(([date, eventsForDate]) => (
            <>
              <div className="event-date-heading-container">
                <h2 className="section-title">{date}</h2>
                <h3 className="event-date-heading-sub">
                  {getDaysUntilDate(date) === 1
                    ? "tomorrow"
                    : `in ${getDaysUntilDate(date)} days`}
                </h3>
              </div>
              <div key={date} className="event-date-section">
                <div className="real-event-list-item-container">
                  {eventsForDate.map((event) => (
                    <RealListItem key={getEventId(event)} event={event} />
                  ))}
                </div>
              </div>
            </>
          ))}
      </div>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <>
          <div className="event-date-section">
            <div className="event-date-heading-container">
              <h2 className="section-title past-events-title">Past</h2>
              <h3 className="event-date-heading-sub">
                {getDaysPast(new Date()) <= 1 ? "yesterday" : "days ago"}
              </h3>
            </div>
          </div>
          <div className="event-list">
            {Object.entries(groupedPastEvents).map(([date, eventsForDate]) => (
              <div key={date} className="event-date-section">
                <h2 className="section-title">{date}</h2>
                <div className="real-event-list-item-container">
                  {eventsForDate.map((event) => (
                    <RealListItem
                      key={getEventId(event)}
                      event={event}
                      isPast={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
