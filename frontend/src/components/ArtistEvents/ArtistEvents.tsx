import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, Event } from "../../utils";
import "./ArtistEvents.css";

export const ArtistEvents: React.FC = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="artist-event-container">
        <div className="artist-event-loading">Events werden geladen...</div>
      </div>
    );
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
        <ul className="artist-event-list">
          {events.map((event) => (
            <li
              key={event.id || event._id}
              className="artist-event-item"
              onClick={() => handleEventClick(event.id || event._id || "")}
            >
              <div className="artist-event-info">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="artist-event-image"
                  />
                )}
                <div className="artist-event-details">
                  <h3>{event.title}</h3>
                  {event.description && (
                    <p className="artist-event-description">
                      {event.description.length > 150
                        ? `${event.description.substring(0, 150)}...`
                        : event.description}
                    </p>
                  )}
                  <div className="artist-event-meta">
                    {event.startDate && (
                      <span>📅 {formatDate(event.startDate)}</span>
                    )}
                    {event.startTime && <span>⏰ {event.startTime}</span>}
                    {event.city && <span>📍 {event.city}</span>}
                    {event.category && <span>🎭 {event.category}</span>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

