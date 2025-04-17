import axios from "axios";
import { ChevronLeft, Heart } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import { EventGalleryII } from "../EventGallery/EventGalleryII";
import "./LikedEvents.css";

export const LikedEvents: React.FC = () => {
  const { favoriteEventIds } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
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
        response.data;
        setEvents(response.data);
      } catch (err) {
        setError("Error fetching liked events");
        console.error("Error fetching liked events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedEvents();
  }, [favoriteEventIds]);

  if (loading) {
    return <div>Loading liked events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (events.length === 0) {
    return (
      <>
        <button onClick={handleBack} className="back-button">
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
        <div className="no-liked-events">
          <Heart size={100} />
          You have not liked any events yet. <br></br>Explore and like some
          events :)
        </div>
      </>
    );
  }

  return (
    <div className="liked-events-container">
      {/* <div className="your-next-events-container">
        <Heart color="white " size={30} />
        <h1 className="your-next-events-heading">Your next Events</h1>
      </div> */}
      {/* <h1 className="section-title">❤️</h1> */}
      <EventGalleryII events={events} title="Liked Events" key={events[0].id} />
    </div>
  );
};
