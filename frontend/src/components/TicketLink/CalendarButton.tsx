import React from "react";
import "./CalendarButton.css";
import { Event, getEventUrl } from "../../utils";
import { CalendarPlus } from "lucide-react";

interface CalendarButtonProps {
  event: Event;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({ event }) => {
  const handleClick = () => {
    if (!event?.startDate) return;

    const formatDate = (date: string) => {
      return date.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const startDate = new Date(event.startDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 5);

    // Format: YYYYMMDDTHHMMSSZ
    const formattedStart = formatDate(startDate.toISOString());
    const formattedEnd = formatDate(endDate.toISOString());

    const eventUrl = getEventUrl(event);
    const description =
      `${event.title} | \nhttps://event-scanner.com${eventUrl}\n\n` +
      "\n-----------------------\nDescription\n" +
      (event.description || "") +
      " " +
      (event.lineup
        ? "\n-----------------------\nLineup:\n" +
          event.lineup.map((artist) => artist.name).join("\n")
        : "");

    let location = "";
    if (event.address) {
      const parts = [
        event.address.city,
        event.address.street,
        event.address.houseNumber,
      ].filter(Boolean);
      location = parts.join(" ");
    } else if (event.city) {
      location = event.city;
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(location)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <div className="calendar-button-container" onClick={handleClick}>
      <div className="calendar-button-icon">
        <CalendarPlus className="h-5 w-5 calendar-icon" />
      </div>
      <span className="calendar-button-text">Add to Calendar</span>
    </div>
  );
};

