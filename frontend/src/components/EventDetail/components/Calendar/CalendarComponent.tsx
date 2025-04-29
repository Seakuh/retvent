import { useState } from "react";
import { Event } from "../../../../types/event";
import "./CalendarComponent.css";

interface CalendarComponentProps {
  events: Event[];
  onClose: () => void;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const CalendarComponent = ({
  events,
  onClose,
  dateRange,
}: CalendarComponentProps) => {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>();
  const [currentYear, setCurrentYear] = useState<number>();

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const generateCalendarDays = () => {
    const days: Date[] = [];
    const start = dateRange?.startDate
      ? new Date(dateRange.startDate)
      : new Date();
    const end = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();
    end.setMonth(end.getMonth() + 1);

    const firstDay = new Date(start);
    while (firstDay.getDay() !== 1) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

    const current = new Date(firstDay);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleDayClick = (day: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else {
      if (day < selectedStart) {
        setSelectedStart(day);
        setSelectedEnd(selectedStart);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedStart) {
      const start = new Date(selectedStart);
      start.setHours(0, 0, 0, 0);

      const end = selectedEnd ? new Date(selectedEnd) : new Date(selectedStart);
      end.setHours(23, 59, 59, 999);

      console.log("Ausgewählter Zeitraum:", { start, end });
      onClose();
    }
  };

  const hasEventOnDay = (day: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const isDayInRange = (day: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    return day >= selectedStart && day <= selectedEnd;
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="calendar-container"
    >
      <div className="calendar-header">
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={new Date().getFullYear() - 5 + i}>
              {new Date().getFullYear() - 5 + i}
            </option>
          ))}
        </select>
      </div>

      <div className="calendar-content" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}

          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                selectedStart?.toDateString() === day.toDateString() ||
                selectedEnd?.toDateString() === day.toDateString()
                  ? "selected"
                  : isDayInRange(day)
                  ? "in-range"
                  : ""
              } ${hasEventOnDay(day) ? "has-event" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day.getDate()}
            </div>
          ))}
        </div>

        <button className="calendar-confirm-button" onClick={handleConfirm}>
          {selectedEnd ? "Confirm" : "Select Date"}
        </button>
      </div>
    </div>
  );
};
