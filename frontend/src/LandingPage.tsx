import React, { useEffect, useState } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { EventList } from './components/EventList/EventList';
import { MapView } from './components/MapView/MapView';
import { ViewToggle } from './components/ViewToggle/ViewToggle';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { Event, ViewMode } from './types/event';
import { Menu, Heart, Upload } from 'lucide-react';
import { EventScanner } from './components/EventScanner/Eventscanner';
import { fetchLatestEvents, fetchUserEvents } from './service';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUploads, setShowUploads] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);

  const loadUserEvents = async () => {
    const events = await fetchUserEvents();
    setUserEvents(events);
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/events/search?query=${keyword}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const latestEvents = await fetchLatestEvents();
        // set the events reverse so the latest events are shown first
        setEvents(latestEvents.reverse());
      } catch (err) {
        console.error("Fehler beim Laden der Events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const toggleFavorite = (eventId: string) => {
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

  const filteredEvents = events
    .filter(event => !selectedCategory || event.category === selectedCategory)
    .filter(event => !showFavorites || favorites.has(event.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000046] to-[#1CB5E0]">
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
              <h1 className="text-3xl font-bold text-white neon-text"></h1>
            </div>
            <div className="flex items-center gap-4">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg glass-effect text-white"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
          {showMenu && (
            <div className="absolute right-4 mt-2 w-48 rounded-lg shadow-lg py-2 bg-blue-500 ">
              {/* Show Favorites Button */}
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Heart size={20} />
                {showFavorites ? "Show All Events" : "Show Favorites"}
              </button>

              {/* My Uploads Button */}
              <button
                onClick={() => {
                  setShowUploads(!showUploads);
                  loadUserEvents(); // Lade Events des Nutzers
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Upload size={20} />
                {showUploads ? "Hide My Uploads" : "My Uploads"}
              </button>
            </div>
          )}


        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div>
            <EventScanner />
          </div>
          <div className="flex justify-between items-center">
            <SearchBar onSearch={handleSearch} />
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-pink"></div>
            </div>
          ) : viewMode === 'list' ? (
            <EventList
              events={filteredEvents}
              onToggleFavorite={toggleFavorite}
              onAddToCalendar={(event) => console.log('Add to calendar:', event)}
              favorites={favorites}
            />
          ) : (
            <MapView
              events={filteredEvents}
              onMarkerClick={(event) => console.log('Clicked event:', event)}
            />
          )}
        </div>


        {showUploads && (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white">Meine hochgeladenen Events</h2>
            {userEvents.length === 0 ? (
              <p className="text-white">Keine hochgeladenen Events gefunden.</p>
            ) : (
              <EventList
                events={userEvents}
                onToggleFavorite={toggleFavorite}
                onAddToCalendar={(event) => console.log('Add to calendar:', event)}
                favorites={favorites}
              />
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default LandingPage;

