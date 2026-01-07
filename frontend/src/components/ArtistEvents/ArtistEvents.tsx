import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, Event } from "../../utils";
import "./ArtistEvents.css";
import { RealListItem } from "../EventGallery/Items/RealListItem";

export const ArtistEvents: React.FC = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artistName) {
      fetchEventsByArtist();
    }
  }, [artistName]);

  const fetchEventsByArtist = async () => {
    if (!artistName) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}events/by-artist/${encodeURIComponent(artistName)}`
      );

      if (!response.ok) {
        throw new Error("Events konnten nicht geladen werden 😢");
      }

      const data = await response.json();
      // Backend könnte ein Array oder ein Objekt mit events-Property zurückgeben
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="artist-event-loading">Events werden geladen...</div>;
  }

  if (error) {
    return (
      <div className="artist-event-container">
        <h2>Events von {artistName}</h2>
        <p className="artist-event-error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="artist-event-container">
      <h2>Events von {artistName} 🎵</h2>
      {events.length === 0 ? (
        <p className="artist-event-no-events">Keine Events gefunden.</p>
      ) : (
        <div className="artist-event-list">
          {events.map((event) => (
            <div className="artist-event-item" key={event.id}>
                <RealListItem event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

