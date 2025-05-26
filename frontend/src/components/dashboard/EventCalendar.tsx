import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Event } from "../../utils";
import styles from "./EventCalendar.module.css";

interface EventCalendarProps {
  events: Event[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert event dates to Date objects for comparison
  const eventDates = events.map((event) => new Date(event.date));

  // Function to check if a date has an event
  const hasEvent = (date: Date) => {
    return eventDates.some(
      (eventDate) =>
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
    );
  };

  // Function to mark dates with events
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && hasEvent(date)) {
      return "has-event";
    }
    return null;
  };

  // Filter events based on selected date (showing all events for now)
  const filteredEvents = events;

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
          className={styles.calendar}
        />
      </div>
      <div className={styles.eventsList}>
        {filteredEvents.map((event) => {
          const progress = (event.ticketsSold / event.ticketsAvailable) * 100;
          const formattedDate = new Date(event.date).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          return (
            <div key={event.id} className={styles.eventCard}>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              <div className={styles.eventDate}>
                <CalendarIcon size={14} />
                {formattedDate}
              </div>
              <div className={styles.eventLocation}>
                <MapPin size={14} />
                {event.location}
              </div>
              <p className={styles.eventDescription}>{event.description}</p>
              <div className={styles.eventFooter}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                    }}
                  >
                    <Users size={14} />
                    <span>
                      {event.ticketsSold} / {event.ticketsAvailable} tickets
                      sold
                    </span>
                  </div>
                  <div className={styles.eventProgress}>
                    <div
                      className={styles.eventProgressBar}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCalendar;
