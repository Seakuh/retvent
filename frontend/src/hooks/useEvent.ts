import axios from "axios";
import { useEffect, useState } from "react";
import { Event, EventProfile, parseEventUrl } from "../utils";

export const useEvent = (eventId?: string, locale: string = 'de') => {
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
        // Parse die URL, um zu prüfen ob es ein slugAndId oder nur eine ID ist
        const parsed = parseEventUrl(eventId);
        
        let response;
        
        // Wenn slugAndId vorhanden ist (Format: slug-shortId), verwende den neuen Slug-Endpoint
        if (parsed.slug && parsed.shortId) {
          const slugAndId = `${parsed.slug}-${parsed.shortId}`;
          try {
            response = await axios.get(
              `${import.meta.env.VITE_API_URL}events/by-slug/${slugAndId}`,
              { params: { locale } }
            );
          } catch (slugErr) {
            // Falls Slug-Endpoint fehlschlägt, versuche Fallback auf byId mit shortId
            // Das Backend sollte den shortId aus dem slugAndId extrahieren können
            response = await axios.get(
              `${import.meta.env.VITE_API_URL}events/v2/byId?id=${parsed.shortId}`
            );
          }
        } else {
          // Kein Slug vorhanden: Verwende den byId-Endpoint mit der vollständigen ID
          response = await axios.get(
            `${import.meta.env.VITE_API_URL}events/v2/byId?id=${parsed.eventId}`
          );
        }
        
        setEvent(response.data);
        if (response.data.host) {
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
  }, [eventId, locale]);

  return { event, loading, error, host };
};
