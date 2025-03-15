import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";

interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  // ... weitere Event-Properties
}

export const LikedEvents: React.FC = () => {
  const { favoriteEventIds } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!favoriteEventIds.length) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}events/byIds`,
          {
            params: {
              ids: favoriteEventIds.join(","),
            },
          }
        );
        setEvents(response.data);
      } catch (err) {
        setError("Fehler beim Laden der favorisierten Events");
        console.error("Error fetching liked events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedEvents();
  }, [favoriteEventIds]);

  if (loading) {
    return <div>Lade favorisierte Events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (events.length === 0) {
    return <div>Sie haben noch keine Events favorisiert.</div>;
  }

  return (
    <div>
      <h1>Ihre favorisierten Events</h1>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
};
