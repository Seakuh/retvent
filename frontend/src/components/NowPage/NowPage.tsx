import React, { useEffect, useState, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Event, FeedResponse } from "../../utils";
import { EventPage } from "../EventPage/EventPage";
import { ExploreFeed } from "../Feed/ExploreFeed";
import { RealListItem } from "../EventGallery/Items/RealListItem";
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

  // Generate date options (today + next 7 days)
  const dateOptions = useMemo(() => {
    const dates: { date: Date; id: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const id = `now-${date.toISOString().split("T")[0]}`;
      const label =
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("de-DE", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
      dates.push({ date, id, label });
    }
    return dates;
  }, []);


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
    handleScroll(); // Initial check
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
      
      // Check if button is outside visible area
      const buttonRight = buttonLeft + buttonWidth;
      const visibleLeft = scrollLeft;
      const visibleRight = scrollLeft + containerWidth;
      
      // Scroll if button is outside visible area
      if (buttonLeft < visibleLeft) {
        // Button is to the left of visible area
        container.scrollTo({
          left: buttonLeft - 20, // Add some padding
          behavior: "smooth",
        });
      } else if (buttonRight > visibleRight) {
        // Button is to the right of visible area
        container.scrollTo({
          left: buttonRight - containerWidth + 20, // Add some padding
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
              {/* <div className="now-section-header">
                <div className="now-section-title-wrapper">
                  <Calendar className="now-section-icon" size={24} />
                  <h2 className="now-section-title">{option.label}</h2>
                  <span className="now-section-badge">{dayEvents.length}</span>
                </div>
              </div> */}
              {dayEvents.length > 0 ? (
                <>
                  {/* Desktop Layout: RealListItem links, Beschreibung rechts */}
                  <div className="now-events-container-desktop">
                    {dayEvents.map((event) => (
                      <div key={event.id || event._id} className="now-event-item">
                        <div className="now-event-item-left">
                          <RealListItem event={event} />
                        </div>
                        <div className="now-event-item-right">
                          <div className="now-event-description">
                            <h3 className="now-event-description-title">{event.title}</h3>
                            <p className="now-event-description-text">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile Layout: Standard EventPage */}
                  <div className="now-events-container-mobile">
                    <EventPage favoriteEvents={dayEvents} />
                  </div>
                </>
              ) : (
                <div className="now-empty-state">
                  <p className="now-empty-message">
                    No events scheduled for {option.label.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
