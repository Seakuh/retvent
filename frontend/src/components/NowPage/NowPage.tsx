import React, { useEffect, useState, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Event, FeedResponse } from "../../utils";
import { EventPage } from "../EventPage/EventPage";
import { ExploreFeed } from "../Feed/ExploreFeed";
import "./NowPage.css";

interface NowPageProps {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}

export const NowPage: React.FC<NowPageProps> = ({
  favoriteEvents,
  feedItemsResponse,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSection, setActiveSection] = useState<string>("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Generate date options from actual event dates
  const dateOptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get unique dates from events
    const uniqueDatesMap = new Map<string, Date>();
    favoriteEvents.forEach((event) => {
      if (event.startDate) {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        const dateKey = eventDate.toISOString().split("T")[0];
        if (!uniqueDatesMap.has(dateKey)) {
          uniqueDatesMap.set(dateKey, eventDate);
        }
      }
    });

    // Sort dates chronologically
    const sortedDates = Array.from(uniqueDatesMap.values()).sort(
      (a, b) => a.getTime() - b.getTime()
    );

    // Create date options with labels
    return sortedDates.map((date) => {
      const id = `now-${date.toISOString().split("T")[0]}`;
      let label: string;

      if (date.getTime() === today.getTime()) {
        label = "Today";
      } else if (date.getTime() === tomorrow.getTime()) {
        label = "Tomorrow";
      } else {
        label = date.toLocaleDateString("de-DE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      }

      return { date, id, label };
    });
  }, [favoriteEvents]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = dateOptions.map((opt) => opt.id);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dateOptions]);

  // Auto-scroll navigation to active section
  useEffect(() => {
    if (!activeSection || !navContainerRef.current) return;

    const activeButton = navContainerRef.current.querySelector(
      `[data-section="${activeSection}"]`
    ) as HTMLElement;

    if (activeButton) {
      const container = navContainerRef.current;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;

      const buttonRight = buttonLeft + buttonWidth;
      const visibleLeft = scrollLeft;
      const visibleRight = scrollLeft + containerWidth;

      if (buttonLeft < visibleLeft) {
        container.scrollTo({
          left: buttonLeft - 20,
          behavior: "smooth",
        });
      } else if (buttonRight > visibleRight) {
        container.scrollTo({
          left: buttonRight - containerWidth + 20,
          behavior: "smooth",
        });
      }
    }
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const checkScrollButtons = () => {
    if (navContainerRef.current) {
      const container = navContainerRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = navContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      navContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    if (navContainerRef.current) {
      navContainerRef.current.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        if (navContainerRef.current) {
          navContainerRef.current.removeEventListener("scroll", checkScrollButtons);
        }
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [dateOptions.length]);

  const handleDateSelect = (date: Date, sectionId: string) => {
    setSelectedDate(date);
    scrollToSection(sectionId);
  };

  return (
    <div className="now-page">
      {/* Horizontal Navigation Bubbles */}
      {dateOptions.length > 0 && (
        <nav className="now-nav">
          {showLeftArrow && (
            <button
              className="now-nav-scroll-btn now-nav-scroll-left"
              onClick={() => scrollNav("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="now-nav-container" ref={navContainerRef}>
            {dateOptions.map((option) => {
              const isSelected =
                selectedDate.toDateString() === option.date.toDateString();
              return (
                <button
                  key={option.id}
                  onClick={() => handleDateSelect(option.date, option.id)}
                  className={`now-nav-item ${isSelected ? "active" : ""} ${
                    activeSection === option.id ? "active-scroll" : ""
                  }`}
                  data-section={option.id}
                >
                  <Calendar size={18} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          {showRightArrow && (
            <button
              className="now-nav-scroll-btn now-nav-scroll-right"
              onClick={() => scrollNav("right")}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </nav>
      )}

      <div className="now-content-wrapper">
        {feedItemsResponse && feedItemsResponse.length > 0 && (
          <ExploreFeed feedItemsResponse={feedItemsResponse} />
        )}
        {dateOptions.map((option) => {
          const dayEvents = favoriteEvents.filter((event) => {
            if (!event.startDate) return false;
            const eventDate = new Date(event.startDate);
            const dayStart = new Date(option.date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(option.date);
            dayEnd.setHours(23, 59, 59, 999);
            return eventDate >= dayStart && eventDate <= dayEnd;
          });

          return (
            <div key={option.id} id={option.id} className="now-section">
              {dayEvents.length > 0 && (
                <EventPage favoriteEvents={dayEvents} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
