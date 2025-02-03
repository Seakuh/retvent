import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { EventList } from '../components/EventList/EventList';
import { Event } from '../types/event';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { isAuthenticated } = useAuth();
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [categoryEvents, setCategoryEvents] = useState<Record<string, Event[]>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  const handleToggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="home-container pb-16">
      <EventList 
        title="Latest Events"
        events={latestEvents}
        onToggleFavorite={handleToggleFavorite}
        favorites={favorites}
      />
      
      {Object.entries(categoryEvents).map(([category, events]) => (
        <EventList 
          key={category}
          title={category}
          events={events}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
      ))}
    </div>
  );
};

export default HomeScreen;
