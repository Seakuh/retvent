import { useEffect, useState } from "react";
import { RealListItem } from "../EventGallery/Items/RealListItem";
import { findSimilarEvents } from "./service";
import "./SimilarEvents.css";

export const SimilarEvents = ({ eventId }: { eventId: string }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await findSimilarEvents(eventId);
      console.log("EVENTS: " + events);
      setEvents(events);
    };
    fetchEvents();
  }, [eventId]);

  return (
    <>
      <div className="similar-events-container-wrapper">
        <div className="similar-events-container">
          {events.map((event) => (
            <RealListItem key={event.event.id} event={event.event} />
          ))}
        </div>
      </div>
    </>
  );
};
