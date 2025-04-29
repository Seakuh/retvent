import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Event } from "../../../../utils";
import "./CalendarComponent.css";

interface CalendarComponentProps {
  events: Event[];
  onClose: () => void;
  setDateRange: (dateRange: { startDate: Date; endDate: Date } | null) => void;
}

export const CalendarComponent = ({
  events,
  onClose,
  setDateRange,
}: CalendarComponentProps) => {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const generateCalendarDays = () => {
    const days: Date[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    // Letzter Tag des Monats
    const lastDay = new Date(year, month + 1, 0);

    // Zum Montag der ersten Woche zurückgehen
    while (firstDay.getDay() !== 1) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

    // Alle Tage generieren
    const current = new Date(firstDay);
    while (current <= lastDay || current.getDay() !== 1) {
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
      setDateRange({ startDate: start, endDate: end });
      onClose();
    }
  };

  const isDayInRange = (day: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    return day >= selectedStart && day <= selectedEnd;
  };

  const handleReset = () => {
    setDateRange(null);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="calendar-container"
    >
      <div className="calendar-content" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="month-nav-button">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="month-year-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={handleNextMonth} className="month-nav-button">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

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
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day.getDate()}
            </div>
          ))}
        </div>
        <div className="calendar-buttons">
          <button className="calendar-reset-button" onClick={handleReset}>
            Reset
          </button>
          <button className="calendar-confirm-button" onClick={handleConfirm}>
            {selectedEnd ? "Confirm" : "Select Date"}
          </button>
        </div>
      </div>
    </div>
  );
};
