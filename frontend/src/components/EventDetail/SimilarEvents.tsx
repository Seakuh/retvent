import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Event } from "../../utils";
import { RealListItem } from "../EventGallery/Items/RealListItem";
import { findSimilarEvents } from "./service";
import "./SimilarEvents.css";

type SimilarEventItem = { event: Event };

export const SimilarEvents = ({ eventId }: { eventId: string }) => {
  const [events, setEvents] = useState<SimilarEventItem[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const scrollByAmount = (amount: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    const maxLeft = Math.max(0, scrollWidth - clientWidth);
    const targetLeft = Math.min(Math.max(0, scrollLeft + amount), maxLeft);
    node.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  const updateScrollState = () => {
    const node = scrollerRef.current;
    if (!node) return;
    const { scrollWidth, clientWidth, scrollLeft } = node;
    const EPSILON = 2; // toleranz gegen Rundungsfehler
    const maxLeft = Math.max(0, scrollWidth - clientWidth);
    const can = scrollWidth > clientWidth + 1;
    setCanScroll(can);
    setIsAtStart(scrollLeft <= EPSILON);
    setIsAtEnd(scrollLeft >= maxLeft - EPSILON);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await findSimilarEvents(eventId);
      console.log("EVENTS: " + events);
      setEvents(events);
    };
    fetchEvents();
  }, [eventId]);

  useEffect(() => {
    // Nach Render der Events prüfen, ob gescrollt werden kann
    const timer = setTimeout(() => {
      // start immer ganz links
      const node = scrollerRef.current;
      if (node) node.scrollTo({ left: 0, behavior: "auto" });
      updateScrollState();
    }, 0);
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [events]);

  return (
    <>
      <div className="similar-events-container-wrapper">
        {canScroll && (
          <button
            type="button"
            className="similar-events-arrow similar-events-arrow-left"
            aria-label="Nach links scrollen"
            onClick={() => scrollByAmount(-600)}
            disabled={isAtStart}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div
          className="similar-events-container"
          ref={scrollerRef}
          onScroll={updateScrollState}
        >
          {events.map((event) => (
            <RealListItem key={event.event.id} event={event.event} />
          ))}
        </div>
        {canScroll && (
          <button
            type="button"
            className="similar-events-arrow similar-events-arrow-right"
            aria-label="Nach rechts scrollen"
            onClick={() => scrollByAmount(600)}
            disabled={isAtEnd}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </>
  );
};
