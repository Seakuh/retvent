import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Event } from '../../types/event';

export const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`https://api.event-scanner.com/events/byId?id=${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <div className="text-center">Loading... 🔄</div>;
  }

  if (!event) {
    return <div className="text-center">Event not found! 😢</div>;
  }

  return (
    <div className="event-detail-container">
      <h1>{event.title}</h1>
      <img src={event.imageUrl} alt={event.title} className="event-image" />
      {/* Add more event details here */}
    </div>
  );
}; 