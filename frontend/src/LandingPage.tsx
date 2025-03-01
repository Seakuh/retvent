import { useEffect, useState } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { EventList } from './components/EventList/EventList';
import { ViewToggle } from './components/ViewToggle/ViewToggle';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { Event, ViewMode } from './types/event';
import { Menu, Heart, Upload, LogIn, Hexagon } from 'lucide-react';
import { EventScanner } from './components/EventScanner/Eventscanner';
import { fetchLatestEvents, fetchUserEvents, searchEventsByCity } from './service';
import { EventGallery } from './components/EventGallery/EventGallery';
import { useNavigate } from 'react-router-dom';


function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUploads, setShowUploads] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  const loadUserEvents = async () => {
    const events = await fetchUserEvents();
    setUserEvents(events);
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const handleSearch = async (keyword: string) => {
    setLoading(true);
    setSearchPerformed(true);
    try {
      const searchResults = await searchEventsByCity(keyword);
      setEvents(searchResults as Event[]);
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnUpload = () => {
    navigate('/admin/events');
  };

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const latestEvents = await fetchLatestEvents();
        console.log('Raw API response:', latestEvents);
        if (Array.isArray(latestEvents) && latestEvents.length > 0) {
          setEvents(latestEvents.reverse());
        } else {
          console.warn('Received empty or invalid events array:', latestEvents);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Events:", err);
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

  return (
    <div className="min-h-screen">
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
              {/* Login Button */}
              <button
                onClick={() => {
                  navigate('/login');
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <LogIn size={20} />
                <p>Login</p>
              </button>
              {/* <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Heart size={20} />
                {showFavorites ? "Show All Events" : "Show Favorites"}
              </button> */}
              <button
                onClick={() => {
                  navigate('/admin/dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Hexagon size={20} />

                <h3>Dashboard</h3>
              </button>


              {/* My Uploads Button */}
              <button
                onClick={() => {
                  setShowUploads(!showUploads);
                  handleOnUpload(); // Lade Events des Nutzers
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Upload size={20} />
                {showUploads ? "Hide My Events" : "My Events"}
              </button>
            </div>
          )}


        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="px-4 py-6">
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
        </div>

        {loading ? (
          <div className="search-loading">
            <div className="search-spinner">
              <div className="search-spinner-inner"></div>
              <div className="search-spinner-text">Searching events...</div>
            </div>
          </div>
        ) : searchPerformed && events.length === 0 ? (
          <div className="no-results">
            <div className="no-results-content">
              <div className="no-results-icon">🚫</div>
              <h2>No Events Found</h2>
              <p>We couldn't find any events in this city</p>
            </div>
          </div>
        ) : (
          <EventGallery
            events={events}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

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

