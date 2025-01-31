import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { EventList } from '../components/EventList/EventList';
import { EventScanner } from '../components/EventScanner/Eventscanner';
import { fetchLocationUpcomingEvents, fetchUserUpcomingEvents } from './service';
import { Event } from '../types/event';
import { fetchLatestEvents } from '../service';
import { EventForm } from '../components/EventForm/EventForm';
const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [locationEvents, setLocationEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showEventForm, setShowEventForm] = useState<boolean>(false);

  useEffect(() => {
    const loadEvents = async () => {
      const userEventsData = await fetchUserUpcomingEvents();
      const latestEventsData = await fetchLatestEvents();
      const locationEventsData = await fetchLocationUpcomingEvents();
      setUserEvents(userEventsData);
      setLatestEvents(latestEventsData)
      setLocationEvents(locationEventsData);
    };
    loadEvents();
  }, []);

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const addToCalendar = (event: Event) => {
    console.log(`Adding ${event.name} to calendar`);
  };


  const handleEventSubmit = async (event: Event) => {
    try {
      const newEvent = await createEvent(event);
      setShowEventForm(false);
      setUserEvents((prevEvents) => [...prevEvents, newEvent]);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="button-group">
        <EventScanner />
        <button className="modern-button create" onClick={() => setShowEventForm(true)}>➕ Add Event</button>
      </div>
      {showEventForm && <EventForm onSubmit={handleEventSubmit} onClose={() => setShowEventForm(false)} />}

      
      <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      
      <div className="event-list">
        <h2>Latest Events</h2>
        <EventList events={latestEvents} onToggleFavorite={toggleFavorite} favorites={favorites} />
      </div>

      <div className="event-list">
        <h2>Your Upcoming Events</h2>
        <EventList events={userEvents} onToggleFavorite={toggleFavorite} favorites={favorites} />
      </div>
      
      <div className="event-list">
        <h2>Upcoming Events Near You</h2>
        <EventList events={locationEvents} onToggleFavorite={toggleFavorite} favorites={favorites} />
      </div>
    </div>
  );
};

export default Home;
