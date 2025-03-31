import axios from "axios";
import { useEffect, useState } from "react";
import { Event, EventProfile } from "../utils";

export const useEvent = (eventId?: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [host, setHost] = useState<EventProfile | null>(null);
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError(new Error("No event ID provided"));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}events/v2/byId?id=${eventId}`
        );
        setEvent(response.data);
        if (response.data.host) {
          console.log(response.data.host);
          setHost(response.data.host);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch event")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    console.log(host);
  }, [eventId]);

  return { event, loading, error, host };
};
