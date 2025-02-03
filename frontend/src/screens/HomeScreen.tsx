import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import { CategoryFilter } from '../components/CategoryFilter';
import { EventList } from '../components/EventList/EventList';
import { Event } from '../types/event';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const endpoint = selectedCategory 
      ? `http://localhost:3145/events/category/${selectedCategory}`
      : 'http://localhost:3145/events/latest?limit=20';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        console.info('Fetched events:', data.events);
        setEvents(data.events);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setIsLoading(false);
      });
  }, [selectedCategory]);

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
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="flex-none">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Scrollbarer Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Featured Events */}
            <EventList 
              title={selectedCategory || "Featured Events"}
              events={events.slice(0, 5)}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />

            {/* Upcoming Events */}
            <EventList 
              title="Upcoming Events"
              events={events.slice(5)}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
