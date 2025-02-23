import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Event } from '../../types/event';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import './EventDetail.css';
import TicketButton from '../Buttons/TicketButton';

const DEFAULT_IMAGE = 'https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png';

interface Location {
  city: string;
  // add other location properties if needed
}

interface EventResponse {
  title: string;
  imageUrl?: string;
  date?: string;
  location?: Location;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDetail: React.FC = () => {
  const { eventid } = useParams<{ eventid: string }>();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventid) return;
      
      try {
        const response = await axios.get(`https://api.event-scanner.com/events/byId?id=${eventid}`);
        console.log('API Response:', response.data);
        setEvent(response.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventid]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="error-message">Event not found 😢</div>;
  }

  return (
    <div className="event-detail">
      <div className="event-hero">
        <img 
          src={event.imageUrl || DEFAULT_IMAGE} 
          alt={event.title} 
          className="event-image"
        />
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>

      <div className="event-content">
        <h1 className="event-title">{event.title}</h1>
        
        <div className="event-info-section">
          {event.date && (
            <div className="event-info">
              <Calendar size={24} />
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <Clock size={24} />
              <span>{new Date(event.date).toLocaleTimeString()}</span>
            </div>
          )}

          {event.location && (
            <div className="event-info">
              <MapPin size={24} />
              <span>{event.location.city}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="event-info-section">
            <p className="event-description">{event.description}</p>
          </div>
        )}

        {event.price && (
          <div className="event-info-section">
            <div className="event-price">
              Ticket Price: {event.price}
            </div>
          </div>
        )}

        {event.ticketLink && (
          <div className="ticket-button-container">
            <TicketButton href={event.ticketLink}></TicketButton>
          </div>
        )}
      </div>
    </div>
  );
}; 