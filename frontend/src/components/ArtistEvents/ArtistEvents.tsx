import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, Event } from "../../utils";
import "./ArtistEvents.css";
import { RealListItem } from "../EventGallery/Items/RealListItem";
import { SocialSearchButtons } from "../EventDetail/components/SocialSearchButtons";
import { Music } from "lucide-react";

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
        throw new Error("Failed to load events");
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="artist-events-page">
        <div className="artist-events-loading">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-events-page">
        <div className="artist-events-header">
          <h1 className="artist-events-title">{artistName}</h1>
        </div>
        <div className="artist-events-error">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-events-page">
      <div className="artist-events-header">
        <div className="artist-events-header-content">
          <div className="artist-events-title-section">
            <Music className="artist-icon" size={32} />
            <h1 className="artist-events-title">{artistName}</h1>
          </div>
          <div className="artist-events-stats">
            <span className="stat-item">
              <span className="stat-number">{events.length}</span>
              <span className="stat-label">Events</span>
            </span>
          </div>
        </div>
        <div className="artist-events-social-section">
          <p className="find-artist-text">Find {artistName} on:</p>
          <SocialSearchButtons title={artistName || ""} />
        </div>
      </div>

      <div className="artist-events-content">
        {events.length === 0 ? (
          <div className="artist-events-empty">
            <p className="empty-message">No events found for this artist.</p>
          </div>
        ) : (
          <div className="artist-events-list">
            {events.map((event) => (
              <div className="artist-event-item" key={event.id}>
                <RealListItem event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

