import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Event } from "../../utils";
import { EventCard } from "./EventCard";
import "./EventSection.css";
interface EventSectionProps {
  title?: string;
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
}

export const EventSection = ({ title, events }: EventSectionProps) => {
  // const emptyEvent = {
  //   id: "",
  //   title: "No events found",
  //   imageUrl:
  //     "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png",
  //   startDate: new Date(),
  //   description: "",
  // };

  const scrollContainer = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = () => {
    const el = scrollContainer.current;
    if (!el) return;

    setIsAtStart(el.scrollLeft <= 0);
    setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainer.current;
    if (el) {
      const scrollAmount = 800;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setTimeout(checkScrollPosition, 300); // nach dem Scrollen Position neu prüfen
    }
  };

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition(); // Initial check

    return () => el.removeEventListener("scroll", checkScrollPosition);
  }, []);

  return (
    <>
      {events.length === 0 ? (
        <></>
      ) : (
        <>
          <h2 className="popular-title">{title}</h2>
          <div className="event-list-wrapper">
            {!isAtStart && events.length > 0 && (
              <button
                className="scroll-button scroll-button-left"
                onClick={() => scroll("left")}
              >
                <ChevronLeft />
              </button>
            )}

            <div className="event-list-container" ref={scrollContainer}>
              {events.map((event) => (
                <div
                  className="event-card-list-item"
                  key={event.id || event._id}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {!isAtEnd && events.length > 0 && (
              <button
                className="scroll-button scroll-button-right"
                onClick={() => scroll("right")}
              >
                <ChevronRight />
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};
