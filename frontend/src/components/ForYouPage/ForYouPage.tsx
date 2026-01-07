import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event, FeedResponse, API_URL } from "../../utils";
import { EventPage } from "../EventPage/EventPage";
import Footer from "../../Footer/Footer";
import "./ForYouPage.css";
import { TrendsListView } from "../EventPage/TrendsListView";

const EVENT_HISTORY_KEY = "recentEvents";
const ARTIST_HISTORY_KEY = "recentArtists";

interface ForYouPageProps {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}

export const ForYouPage: React.FC<ForYouPageProps> = ({
  favoriteEvents,
  feedItemsResponse,
}) => {
  const navigate = useNavigate();
  const [historyEvents, setHistoryEvents] = useState<Event[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [recentArtists, setRecentArtists] = useState<string[]>([]);

  useEffect(() => {
    const loadHistoryEvents = async () => {
      try {
        setLoadingHistory(true);
        const historyIds = localStorage.getItem(EVENT_HISTORY_KEY);
        if (!historyIds) {
          setHistoryEvents([]);
          setLoadingHistory(false);
          return;
        }

        const eventIds: string[] = JSON.parse(historyIds);
        if (eventIds.length === 0) {
          setHistoryEvents([]);
          setLoadingHistory(false);
          return;
        }

        // Fetch events by IDs
        const eventsPromises = eventIds.map(async (id) => {
          try {
            const response = await fetch(`${API_URL}events/v2/byId?id=${id}`);
            if (!response.ok) return null;
            return await response.json();
          } catch (error) {
            console.error(`Failed to fetch event ${id}:`, error);
            return null;
          }
        });

        const events = await Promise.all(eventsPromises);
        const validEvents = events.filter(
          (event): event is Event => event !== null
        );

        setHistoryEvents(validEvents);
      } catch (error) {
        console.error("Failed to load history events:", error);
        setHistoryEvents([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistoryEvents();
  }, []);

  useEffect(() => {
    const loadRecentArtists = () => {
      try {
        const artistsJson = localStorage.getItem(ARTIST_HISTORY_KEY);
        if (artistsJson) {
          const artists: string[] = JSON.parse(artistsJson);
          setRecentArtists(artists);
        }
      } catch (error) {
        console.error("Failed to load recent artists:", error);
        setRecentArtists([]);
      }
    };

    loadRecentArtists();
  }, []);

  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}/events`);
  };

  // Split favorite events into upcoming and past
  const now = new Date();
  const upcomingFavoriteEvents = favoriteEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate >= now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const pastFavoriteEvents = favoriteEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate < now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  // Split history events into upcoming and past
  const upcomingHistoryEvents = historyEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate >= now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const pastHistoryEvents = historyEvents
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return eventDate < now;
    })
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  return (
    <div className="foryou-page">
      <div className="foryou-content-wrapper">
        {/* Upcoming Favorite Events */}
        {upcomingFavoriteEvents.length > 0 && (
          <div className="foryou-section">
            <h2 className="foryou-section-title">
              Your upcoming events
            </h2>
            <div className="foryou-events-list">
              {upcomingFavoriteEvents.map((event, index) => (
                <TrendsListView key={event.id || event._id || index} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Past Favorite Events */}
        {pastFavoriteEvents.length > 0 && (
          <div className="foryou-section">
            <h2 className="foryou-section-title">
              Your past events
            </h2>
            <div className="foryou-events-list">
              {pastFavoriteEvents.map((event, index) => (
                <TrendsListView key={event.id || event._id || index} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Artists Section */}
        {recentArtists.length > 0 && (
          <div className="foryou-section">
            <h2 className="foryou-section-title">
              Recently Viewed Artists ({recentArtists.length})
            </h2>
            <div className="foryou-artists-list">
              {recentArtists.map((artistName, index) => (
                <div
                  key={`${artistName}-${index}`}
                  className="foryou-artist-item"
                  onClick={() => handleArtistClick(artistName)}
                >
                  <span className="foryou-artist-name">{artistName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {historyEvents.length > 0 && (
          <>
            {upcomingHistoryEvents.length > 0 && (
              <div className="foryou-section">
                <h2 className="foryou-section-title">
                  Recently Viewed - Upcoming ({upcomingHistoryEvents.length})
                </h2>
                <div className="foryou-events-list">
                  {upcomingHistoryEvents.map((event, index) => (
                    <TrendsListView key={event.id || event._id || index} event={event} index={index} />
                  ))}
                </div>
              </div>
            )}
            {pastHistoryEvents.length > 0 && (
              <div className="foryou-section">
                <h2 className="foryou-section-title">
                  Recently Viewed - Past ({pastHistoryEvents.length})
                </h2>
                <div className="foryou-events-list">
                  {pastHistoryEvents.map((event, index) => (
                    <TrendsListView key={event.id || event._id || index} event={event} index={index} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {loadingHistory && (
          <div className="foryou-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="foryou-section">    
          <h2 className="foryou-section-title">
            Recommended Events
          </h2>
           <EventPage
          favoriteEvents={favoriteEvents}
          feedItemsResponse={feedItemsResponse}
        />
        </div>

        {!loadingHistory && historyEvents.length === 0 && (
          <div className="foryou-section">
            <div className="foryou-empty">
              <p className="empty-message">
                No recently viewed events. Start exploring events to see them here!
              </p>
            </div>
          </div>
        )}



        <Footer />
      </div>
    </div>
  );
};

