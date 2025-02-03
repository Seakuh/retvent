import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EventDetail } from '../components/EventDetail';
import { Event } from '../types/event';

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3145/events/byId?id=${id}`)
      .then(res => res.json())
      .then(data => setEvent(data));
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return <EventDetail event={event} />;
};

export default EventDetailPage; 