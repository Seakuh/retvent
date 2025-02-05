import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import { CategoryFilter } from '../components/CategoryFilter';
import { EventList } from '../components/EventList/EventList';
import { LocationList } from '../components/LocationList/LocationList';
import { Event } from '../types/event';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Location } from '../types/location';

const HomeScreen = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [followedLocations, setFollowedLocations] = useState(new Set());
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
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.error('Events data is not an array:', data);
          setEvents([]);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setEvents([]);
        setIsLoading(false);
      });

    // Lade Locations
    fetch(`http://localhost:3145/locations`)
      .then(res => res.json())
      .then(data => {
        // Stelle sicher, dass wir ein Array haben
        const locationArray = Array.isArray(data) ? data : data.locations || [];
        setLocations(locationArray);
      })
      .catch(error => {
        console.error('Error fetching locations:', error);
        setLocations([]);
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

  const handleToggleFollow = async (locationId) => {
    if (!isAuthenticated) {
      toast.error('Please login to follow locations');
      return;
    }

    try {
      const method = followedLocations.has(locationId) ? 'DELETE' : 'POST';
      await fetch(`http://localhost:3145/locations/${locationId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFollowedLocations(prev => {
        const next = new Set(prev);
        if (next.has(locationId)) {
          next.delete(locationId);
        } else {
          next.add(locationId);
        }
        return next;
      });

      toast.success(
        followedLocations.has(locationId) 
          ? 'Location unfollowed' 
          : 'Location followed'
      );
    } catch (error) {
      toast.error('Failed to update location follow status');
    }
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

            <LocationList
              title="Popular Locations"
              locations={locations}
              onToggleFollow={handleToggleFollow}
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
