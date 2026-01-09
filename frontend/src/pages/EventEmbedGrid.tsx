import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Event } from "../utils";
import "./EventEmbedGrid.css";
import { EmbedGridCard } from "../components/EmbedGridCard/EmbedGridCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const EventEmbedGrid: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Host Id filter
  const hostId = searchParams.get("hostId");

  // Background color filter
  const backgroundParam = searchParams.get("background") || "0D0E23";
  const background = backgroundParam.startsWith("#") ? backgroundParam : `#${backgroundParam}`;
  
  // Secondary color for cards
  const secondaryColorParam = searchParams.get("secondaryColor") || "000000";
  const secondaryColor = secondaryColorParam.startsWith("#") ? secondaryColorParam : `#${secondaryColorParam}`;

  // Parse query parameters
  const limit = parseInt(searchParams.get("limit") || "999");

  useEffect(() => {
    // Set background color
    document.body.style.setProperty("background", background, "important");
    document.body.style.setProperty("background-color", background, "important");
    document.body.style.setProperty("background-image", "none", "important");
    document.documentElement.style.setProperty("background", background, "important");
    document.documentElement.style.setProperty("background-color", background, "important");
    document.documentElement.style.setProperty("background-image", "none", "important");

    const root = document.getElementById("root");
    if (root) {
      root.style.setProperty("background", background, "important");
      root.style.setProperty("background-color", background, "important");
    }
  }, [background]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Use different endpoint based on whether hostId is provided
        const apiUrl = hostId
          ? `${API_URL}events/host/id/${hostId}`
          : `${API_URL}events/latest`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        let fetchedEvents: Event[] = data.events || data || [];

        // Filter events by upcoming only (no past events)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        fetchedEvents = fetchedEvents.filter((event) => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          const eventDateStart = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate()
          );
          return eventDateStart >= todayStart;
        });

        // Sort ascending by date
        fetchedEvents.sort((a, b) => {
          const dateA = new Date(a.startDate || new Date()).getTime();
          const dateB = new Date(b.startDate || new Date()).getTime();
          return dateA - dateB;
        });

        // Apply limit
        setEvents(fetchedEvents.slice(0, limit));
      } catch (error) {
        console.error("Error fetching events for embed grid:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, [hostId, limit]);

  if (loading) {
    return (
      <div className="embed-grid-loading">
        <div className="embed-grid-spinner"></div>
      </div>
    );
  }

  return (
    <div className="event-embed-grid-container" style={{ backgroundColor: background }}>
      {events.length === 0 ? (
        <div className="embed-grid-no-events">
          <p>No upcoming events found.</p>
        </div>
      ) : (
        <div className="event-embed-grid-wrapper">
          {events.map((event) => (
            <div key={event.id || event._id} className="event-embed-grid-item">
              <EmbedGridCard event={event} secondaryColor={secondaryColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventEmbedGrid;

