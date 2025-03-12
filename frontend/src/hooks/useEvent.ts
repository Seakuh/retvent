import axios from "axios";
import { useEffect, useState } from "react";
import { Event } from "../utils";

export const useEvent = (eventId?: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError(new Error("No event ID provided"));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}events/byId?id=${eventId}`
        );
        setEvent(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch event")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
};
