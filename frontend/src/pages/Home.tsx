import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EventsContainer } from '../components/EventsContainer';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [latestEvents, setLatestEvents] = useState([]);
  const [categoryEvents, setCategoryEvents] = useState({});

  useEffect(() => {
    // Fetch latest events
    fetch('http://localhost:3145/events/latest')
      .then(res => res.json())
      .then(data => setLatestEvents(data.events));

    // Fetch events by category
    ['Music', 'Sports', 'Art', 'Food'].forEach(category => {
      fetch(`http://localhost:3145/events/category/${category}`)
        .then(res => res.json())
        .then(data => setCategoryEvents(prev => ({
          ...prev,
          [category]: data.events
        })));
    });
  }, []);

  return (
    <div className="pb-16">
      <EventsContainer title="Latest Events" events={latestEvents} />
      
      {Object.entries(categoryEvents).map(([category, events]) => (
        <EventsContainer 
          key={category} 
          title={category} 
          events={events as any[]} 
        />
      ))}
    </div>
  );
}; 