import React from "react";
import { Event, formatDate, getDaysPast, getDaysUntilDate } from "../../utils";
import { SponsoredDetail } from "../Sponsored/SponsoredDetail";
import "./EventGalleryII.css";
import { RealListItem } from "./Items/RealListItem";
import ReelTile from "./ReelTile";
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

  // Funktion um zufällig zu entscheiden ob ein ReelTile eingefügt werden soll
  const shouldShowReelTile = () => Math.random() < 0.5; // 30% Wahrscheinlichkeit

  // Funktion um zufällige Events für ReelTile zu wählen
  const getRandomEventsForReel = (allEvents: Event[]) => {
    const shuffled = [...allEvents].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(5, shuffled.length));
  };

  return (
    <div className="event-gallery-container">
      {/* Today Section */}
      <div className="event-list">
        <div className="event-date-heading-container">
          {todayEvents.length > 0 && <h2 className="section-title">Today</h2>}
        </div>
        <div className="event-date-section">
          {/* <ReelTile events={[...todayEvents, ...events].slice(0, 4)} /> */}
          <div className="real-event-list-item-container">
            {todayEvents.map((event) => (
              <div key={getEventId(event)}>
                {Math.random() < 0.3 && <SponsoredDetail size="s" />}
                <RealListItem key={getEventId(event)} event={event} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Section */}
        {Object.keys(groupedUpcomingEvents).length > 0 &&
          Object.entries(groupedUpcomingEvents).map(
            ([date, eventsForDate], index) => (
              <React.Fragment key={date}>
                <div className="event-date-heading-container">
                  <h2 className="section-title">{date}</h2>
                  <h3 className="event-date-heading-sub">
                    {getDaysUntilDate(date) === 1
                      ? "tomorrow"
                      : `in ${getDaysUntilDate(date)} days`}
                  </h3>
                </div>
                <div className="event-date-section">
                  {/* {shouldShowReelTile() && (
                    <ReelTile events={getRandomEventsForReel(events)} />
                  )} */}
                  <div className="real-event-list-item-container">
                    {eventsForDate.map((event) => (
                      <div key={getEventId(event)}>
                        {Math.random() < 0.3 && <SponsoredDetail size="s" />}
                        <RealListItem key={getEventId(event)} event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            )
          )}
      </div>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <>
          <div className="event-list">
            {Object.entries(groupedPastEvents).map(([date, eventsForDate]) => (
              <div key={date} className="event-date-section">
                <div className="event-date-heading-container">
                  <h2 className="section-title">{date}</h2>
                  <h3 className="event-date-heading-sub event-date-heading-sub-past">
                    {getDaysPast(date) <= 1
                      ? "yesterday"
                      : `${getDaysPast(date)} days ago`}
                  </h3>
                </div>
                {/* Zufälliges ReelTile vor den vergangenen Events */}
                {shouldShowReelTile() && (
                  <ReelTile events={getRandomEventsForReel(events)} />
                )}
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
