import { useRef } from "react";
import { EventCard } from "./EventCard";
import "./EventCard.css";

export const EventList = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 300; // Scroll-Distanz in Pixeln
      const newScrollPosition =
        containerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      containerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="scroll-arrow scroll-left"
        onClick={() => scroll("left")}
        aria-label="scroll left"
      >
        ←
      </button>

      <div className="events-container" ref={containerRef}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <button
        className="scroll-arrow scroll-right"
        onClick={() => scroll("right")}
        aria-label="scroll right"
      >
        →
      </button>
    </div>
  );
};
