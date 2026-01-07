import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, Event } from "../../utils";
import "./ArtistEvents.css";
import { RealListItem } from "../EventGallery/Items/RealListItem";
import { SocialSearchButtons } from "../EventDetail/components/SocialSearchButtons";
import { ChevronLeft } from "lucide-react";
import { SimilarEvents } from "../EventDetail/SimilarEvents";
import { SimilarArtists } from "./SimilarArtists";

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

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="artist-events-page">
      
      <div className="artist-events-header">
      <button onClick={handleBack} className="artist-events-back-button">
        <ChevronLeft className="h-5 w-5" />
      </button>
        <div className="artist-events-header-content">
          <div className="artist-events-title-section">
            <h1 className="artist-events-title">{artistName}</h1>
            <span className="artist-events-count">
              {events.length} {events.length === 1 ? "Event" : "Events"}
            </span>
          </div>
          <div className="artist-events-social-section">
            <SocialSearchButtons title={artistName || ""} />
          </div>
        </div>
      </div>

      <div className="artist-events-content-wrapper">
        {events.length === 0 ? (
          <div className="artist-events-empty">
            <p className="empty-message">No events found for this artist.</p>
          </div>
        ) : (
          <div className="artist-events-list">
            {events.map((event) => (
              <div key={event.id} className="artist-event-item-wrapper">
                <RealListItem event={event} />
              </div>
            ))}
          </div>
        )}
        {events.length > 0 && (
          <>
            <div className="artist-events-section">
              <h2 className="artist-events-section-title">Similar Artists</h2>
              <SimilarArtists events={events} currentArtistName={artistName || ""} />
            </div>
            <div className="artist-events-section">
              <h2 className="artist-events-section-title">Similar Events</h2>
              <div className="artist-events-similar-events-container">
                <SimilarEvents eventId={events[0].id || events[0]._id || ""} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

