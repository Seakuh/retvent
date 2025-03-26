import {
  Heart,
  Hexagon,
  Info,
  LogIn,
  Menu,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CategoryFilter } from "./components/CategoryFilter/CategoryFilter";
import { EventGalleryII } from "./components/EventGallery/EventGalleryII";
import { EventList } from "./components/EventList/EventList";
import { EventPage } from "./components/EventPage/EventPage";
import { EventSection } from "./components/EventPage/EventSection";
import { EventScanner } from "./components/EventScanner/Eventscanner";
import { LikedEvents } from "./components/LikedEvents/LikedEvents";
import SearchModal from "./components/SearchModal/SearchModal";
import { ViewToggle } from "./components/ViewToggle/ViewToggle";
import Footer from "./Footer/Footer";
import {
  fetchEventsByCategory,
  fetchLatestEvents,
  searchEventsByKeyword,
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
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Öffne Search Modal bei Strg+L
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault(); // Verhindert das Standard-Browser-Verhalten
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup beim Unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleSearch = async (searchTerm: string) => {
    setSelectedCategory("All");
    setLoading(true);
    setSearchPerformed(true);
    try {
      const searchResults = await searchEventsByKeyword(searchTerm);
      setEvents(searchResults as Event[]);
      setIsSearchOpen(false);
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
    searchParams.set("category", category);
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

  const handleGenreSelect = useCallback(
    async (genres: string[]) => {
      console.log("Selected genres:", genres);
      setSelectedGenres(genres);
      setLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_URL}events`;
        const params = new URLSearchParams();

        if (
          selectedCategory &&
          selectedCategory !== "All" &&
          selectedCategory !== "Home"
        ) {
          params.append("category", selectedCategory);
        }

        if (genres.length > 0) {
          params.append("genres", genres.join(","));
        }

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Fehler beim Laden der Events:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_URL}events`;
        const params = new URLSearchParams();

        if (
          selectedCategory &&
          selectedCategory !== "All" &&
          selectedCategory !== "Home"
        ) {
          params.append("category", selectedCategory);
        }

        if (selectedGenres.length > 0) {
          params.append("genres", selectedGenres.join(","));
        }

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Fehler beim Laden der Events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [selectedCategory, selectedGenres]);

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
              <button
                className="search-icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={24} color="white" />
              </button>
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
              {/* About Button */}
              <button
                onClick={() => {
                  navigate("/about");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Info size={20} />
                <p>About</p>
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
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onGenreSelect={handleGenreSelect}
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
          <div className="no-results mt-10">
            <div className="no-results-content text-center flex flex-col items-center justify-center">
              <div className="no-results-icon text-7xl">🚫</div>
              <h2 className="text-2xl font-bold mt-6">No Events Found</h2>
            </div>
          </div>
        ) : viewMode === "map" ? (
          <LikedEvents />
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
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
      <Footer />
    </div>
  );
}

export default LandingPage;
