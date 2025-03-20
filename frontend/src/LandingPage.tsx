import { Heart, Hexagon, LogIn, Menu, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CategoryFilter } from "./components/CategoryFilter/CategoryFilter";
import { EventGalleryII } from "./components/EventGallery/EventGalleryII";
import { EventList } from "./components/EventList/EventList";
import { EventPage } from "./components/EventPage/EventPage";
import { EventSection } from "./components/EventPage/EventSection";
import { EventScanner } from "./components/EventScanner/Eventscanner";
import { MapView } from "./components/MapView/MapView";
import { SearchBar } from "./components/SearchBar/SearchBar";
import { ViewToggle } from "./components/ViewToggle/ViewToggle";
import {
  fetchEventsByCategory,
  fetchLatestEvents,
  searchEventsByCity,
} from "./service";
import { ViewMode } from "./types/event";
import { Event } from "./utils";

function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showUploads, setShowUploads] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "All"
  );
  const navigate = useNavigate();
  const params = useParams();

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    setSearchPerformed(true);
    try {
      const searchResults = await searchEventsByCity(keyword);
      setEvents(searchResults as Event[]);
    } catch (error) {
      console.error("Error searching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnUpload = () => {
    navigate("/admin/events");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    // Prüfe erst URL-Parameter
    const queryParamCategory = searchParams.get("category");
    // Prüfe dann Route-Parameter
    const routeParamCategory = params.category;

    const categoryToUse = queryParamCategory || routeParamCategory;

    if (categoryToUse) {
      setSelectedCategory(categoryToUse);
      // Wenn die Kategorie über Route-Parameter kam, setzen wir auch die SearchParams
      if (routeParamCategory && !queryParamCategory) {
        searchParams.set("category", routeParamCategory);
        setSearchParams(searchParams);
      }
    }

    const loadEvents = async () => {
      setLoading(true);
      try {
        const events =
          categoryToUse && categoryToUse !== "All"
            ? await fetchEventsByCategory(categoryToUse)
            : await fetchLatestEvents();

        if (Array.isArray(events) && events.length > 0) {
          setEvents(events.reverse());
        }
      } catch (err) {
        console.error("Fehler beim Laden der Events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchParams, params.category]);

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

  const handleMarkerClick = (event: Event) => {
    navigate(`/event/${event._id}`);
  };

  return (
    <div className="min-h-screen">
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 rounded-md"
                onClick={() => navigate("/")}
              />
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
                  navigate("/admin/dashboard");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Hexagon size={20} />

                <h3>Dashboard</h3>
              </button>
              <button
                onClick={() => {
                  navigate("/admin/events/create");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Plus size={20} />
                <p>Create Event</p>
              </button>
              <button
                onClick={() => {
                  navigate("/liked");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Heart size={20} />
                <p>Liked Events</p>
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
              {/* Login Button */}
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <LogIn size={20} />
                <p>Login</p>
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
            onCategoryChange={handleCategoryChange}
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
        ) : viewMode === "map" ? (
          <MapView onMarkerClick={handleMarkerClick} />
        ) : selectedCategory === "Home" ? (
          <EventPage />
        ) : (
          <div>
            <EventSection
              title="Popular"
              events={events.sort((a, b) => (b.views || 0) - (a.views || 0))}
            />
            <EventGalleryII
              title={selectedCategory}
              events={events}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {showUploads && (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white">
              Meine hochgeladenen Events
            </h2>
            {userEvents.length === 0 ? (
              <p className="text-white">Keine hochgeladenen Events gefunden.</p>
            ) : (
              <EventList
                events={userEvents}
                onToggleFavorite={toggleFavorite}
                onAddToCalendar={(event) =>
                  console.log("Add to calendar:", event)
                }
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
