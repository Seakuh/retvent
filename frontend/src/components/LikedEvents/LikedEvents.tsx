import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import "./LikedEvents.css";

export const LikedEvents: React.FC = () => {
  const { favoriteEventIds } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        console.log(response.data);
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
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="liked-events-container">
      <button onClick={handleBack} className="back-button">
        ← Back
      </button>
      <h1 className="liked-events-title">❤️ Your favorite events</h1>

      <div className="liked-events-list">
        {events.map((event) => (
          <div
            onClick={() => navigate(`/event/${event.id}`)}
            className="liked-events-item"
            key={event.id}
          >
            <img
              className="liked-events-image"
              src={event.imageUrl}
              alt={event.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
