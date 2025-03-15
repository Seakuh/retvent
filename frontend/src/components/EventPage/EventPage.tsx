import { useEffect, useState } from "react";
import {
  fetchFavoriteEvents,
  fetchNearbyEvents,
  fetchNewEvents,
} from "./service";
export const EventPage = () => {
  const { user } = useUser();
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

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await fetchFavoriteEvents();
      setFavoriteEvents(events);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h1 className="section-title">Nearby Events</h1>
      <ul>
        {nearbyEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
      <h1 className="section-title">New Events</h1>
      <ul>
        {newEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
      <h1 className="section-title">Favorite Events</h1>
      <ul>
        {favoriteEvents.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </div>
  );
};
