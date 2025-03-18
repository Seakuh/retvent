import { useEffect, useState } from "react";
import { Event } from "../../utils";
import { EventSection } from "./EventSection";
import { fetchNearbyEvents, fetchNewEvents } from "./service";
export const EventPage = () => {
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [newEvents, setNewEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await fetchNearbyEvents();
      setNearbyEvents(events);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await fetchNewEvents();
      setNewEvents(events);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <EventSection title="Nearby Events" events={nearbyEvents} />
      <EventSection title="New Events" events={newEvents} />
      <EventSection title="Favorite Events" events={favoriteEvents} />
    </div>
  );
};
