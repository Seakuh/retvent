import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Event } from "../../../../utils";
import "./CalendarComponent.css";

interface CalendarComponentProps {
  events: Event[];
  onClose: () => void;
  onReset: () => void;
  setDateRange: (dateRange: { startDate: Date; endDate: Date } | null) => void;
  prevDateRange?: { startDate: Date; endDate: Date } | null;
}

export const CalendarComponent = ({
  events,
  onClose,
  setDateRange,
  onReset,
  prevDateRange,
}: CalendarComponentProps) => {
  const [selectedStart, setSelectedStart] = useState<Date | null>(
    prevDateRange?.startDate || null
  );
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(
    prevDateRange?.endDate || null
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthImageCache, setMonthImageCache] = useState<
    Record<string, string>
  >({});
  const [isEditingDate, setIsEditingDate] = useState(false);

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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    while (firstDay.getDay() !== 1) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

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

      setDateRange({ startDate: start, endDate: end });
      onClose();
    }
  };

  const handleReset = () => {
    setDateRange(null);
    onClose();
  };

  const isDayInRange = (day: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    return day >= selectedStart && day <= selectedEnd;
  };

  // Events als Map für schnellen Zugriff vorbereiten
  const eventMap = useMemo(() => {
    const map: Record<string, Event> = {};
    events.forEach((event) => {
      const dayString = event.startDate.split("T")[0];
      map[dayString] = event;
    });
    return map;
  }, [events]);

  // Monatlichen Cache nur ergänzen, nicht neu bauen
  useEffect(() => {
    const days = generateCalendarDays();
    setMonthImageCache((prevCache) => {
      const newCache = { ...prevCache };
      let updated = false;

      days.forEach((day) => {
        const dayString = day.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
        if (!newCache[dayString]) {
          const event = eventMap[dayString];
          if (event?.imageUrl) {
            newCache[
              dayString
            ] = `url(https://img.event-scanner.com/insecure/blur:1/q:20/w:100/plain/${event.imageUrl}@webp)`;
          } else {
            newCache[dayString] = "none";
          }
          updated = true;
        }
      });

      return updated ? newCache : prevCache;
    });
  }, [currentDate, eventMap]);

  const getEventBackground = (day: Date) => {
    const dayString = day.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
    return monthImageCache[dayString] || "none";
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextMonth(),
    onSwipedRight: () => handlePrevMonth(),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  // Hilfsfunktion für Jahresauswahl
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
  };

  // Handler für Datum-Änderungen
  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.setMonth(monthIndex)));
    setIsEditingDate(false);
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(currentDate.setFullYear(year)));
    setIsEditingDate(false);
  };

  // Event-Handler für Tastatureingaben hinzufügen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevMonth();
      } else if (e.key === "ArrowRight") {
        handleNextMonth();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="calendar-container"
    >
      <button
        className="close-feed-modal-button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={30} />
      </button>
      <div className="month-nav-buttons">
        <button onClick={handlePrevMonth} className="month-nav-button">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button onClick={handleNextMonth} className="month-nav-button">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div
        className="calendar-content"
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
      >
        <div className="calendar-header">
          <div className="date-selector-container">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="date-selector"
            >
              {monthNames.map((month, index) => (
                <option className="selector-option" key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="date-selector"
            >
              {getYearOptions().map((year) => (
                <option className="selector-option" key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`weekday-header ${
                day === "Sa" || day === "Su" ? "weekend-header" : ""
              }`}
            >
              {day}
            </div>
          ))}

          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`calendar-day
                ${
                  day.toDateString() === new Date().toDateString()
                    ? "calendar-day-today"
                    : ""
                }
                ${
                  selectedStart?.toDateString() === day.toDateString() ||
                  selectedEnd?.toDateString() === day.toDateString()
                    ? "selected"
                    : isDayInRange(day)
                    ? "in-range"
                    : ""
                }
                ${
                  day.getDay() === 0 || day.getDay() === 6 ? "weekend-day" : ""
                }`}
              style={{
                backgroundImage: getEventBackground(day),
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => handleDayClick(day)}
            >
              {day.getDate()}
            </div>
          ))}
        </div>

        <div className="calendar-buttons">
          <button className="calendar-reset-button" onClick={onReset}>
            Today
          </button>
          <button className="calendar-confirm-button" onClick={handleConfirm}>
            {selectedEnd ? "Confirm" : "Select Date"}
          </button>
        </div>
      </div>
    </div>
  );
};
