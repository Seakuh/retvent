import {
  Compass,
  Home,
  Info,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Smartphone,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryFilter } from "./components/CategoryFilter/CategoryFilter";
import { CityBar } from "./components/CityBar/CityBar";
import { EventPage } from "./components/EventPage/EventPage";
import { fetchFavoriteEvents } from "./components/EventPage/service";
import {
  getLatestFeedAll,
  getLatestFeedByFollowing,
} from "./components/Feed/service";
import SearchModal from "./components/SearchModal/SearchModal";
import { UserContext } from "./contexts/UserContext";
import Footer from "./Footer/Footer";
import { HelmetMeta } from "./LandingPageHelmet";
import { useLandingSearch } from "./LandinSearchContext";
import { searchEvents } from "./service";
import { ViewMode } from "./types/event";
import { UploadModal } from "./UploadModal/UploadModal";
import { Event, FeedResponse } from "./utils";
function LandingPage() {
  // Search State
  const {
    location,
    startDate,
    endDate,
    category,
    prompt,
    view,
    setSearchState,
  } = useLandingSearch();
  const [viewMode, setViewMode] = useState<ViewMode>(view || "All");
  const { user, loggedIn, setLoggedIn, favoriteEventIds } =
    useContext(UserContext);

  // Event State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // User Page
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [showUploads, setShowUploads] = useState(false);
  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);

  // Search State
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Navigation State
  const navigate = useNavigate();

  // Feed State
  const [feedItemsResponse, setFeedItemsResponse] = useState<FeedResponse[]>(
    []
  );

  const handleLogout = () => {
    setFavoriteEvents([]);
    setFollowedProfiles([]);
    setLoggedIn(false);
    setViewMode("All");
    window.location.reload();
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setViewMode("Home");
        setSearchState({ view: "Home" });
      }
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setViewMode("All");
        setSearchState({ view: "All" });
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleSearch = async (searchTerm: string) => {
    setSearchState({ prompt: searchTerm });
    setLoading(true);
    setSearchPerformed(true);
    try {
      const searchResults = await searchEvents(
        location === "Worldwide" ? undefined : location,
        category,
        searchTerm,
        startDate,
        endDate
      );
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

  const handleViewChange = (view: ViewMode) => {
    setSearchState({ view });
    if (view == "All") {
      setSearchState({
        prompt: "",
        category: "",
        view: "All",
        startDate: startDate || "",
        endDate: endDate || "",
      });
      setViewMode("All");
    }
    setViewMode(view);
  };

  const handleCategoryChange = (category: string | null) => {
    setSearchState({
      category: category || "",
      startDate: startDate || "",
      endDate: endDate || "",
      prompt: prompt || "",
      location: location || "",
    });
  };

  const handleDateChange = (dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setSearchState({
      startDate: dateRange.startDate?.toISOString() || "",
      endDate: dateRange.endDate?.toISOString() || "",
    });
  };

  const handleLocationChange = (location: string) => {
    setSearchState({ location });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (favoriteEventIds.length > 0) {
          const [favoriteEvents, followedProfiles] = await Promise.all([
            fetchFavoriteEvents(favoriteEventIds, {
              startDate,
              endDate,
              category,
              location,
              prompt,
            }),
            getLatestFeedByFollowing(),
          ]);
          setFavoriteEvents(favoriteEvents);
          setFollowedProfiles(followedProfiles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    startDate,
    endDate,
    category,
    location,
    prompt,
    loggedIn,
    favoriteEventIds,
  ]);

  useEffect(() => {
    const searchQuery = prompt;
    const categoryQuery = category;
    const locationQuery = location;
    const startDateQuery = startDate;
    const endDateQuery = endDate;

    const loadEvents = async () => {
      setLoading(true);
      try {
        const events = await searchEvents(
          locationQuery,
          categoryQuery,
          searchQuery,
          startDateQuery,
          endDateQuery
        );
        if (Array.isArray(events)) {
          setEvents(events.reverse());
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadFeedItems = async () => {
      const feedItemsResponse = await getLatestFeedAll();
      setFeedItemsResponse(feedItemsResponse);
    };
    loadFeedItems();
    loadEvents();
    // loadProfiles();
  }, [location, category, prompt, startDate, endDate, loggedIn]);

  const handleInstallClick = async () => {
    navigate("/install-app");
  };

  // Füge useEffect für den Click-Outside-Listener hinzu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuButton = document.querySelector(".menu-button");
      const menu = document.querySelector(".menu-container");

      if (
        showMenu &&
        menu &&
        !menu.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      <HelmetMeta />
      <div className="min-h-screen flex">
        {/* Desktop Sidebar - nur auf md und größer sichtbar */}
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 backdrop-blur-[30px] bg-[color:var(--color-neon-blue-dark)/80] border-r-[1px] border-r-[color:var(--color-neon-blue-light)]">
          <div className="p-4">
            <div className="flex items-center gap-3 cursor-pointer mb-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 rounded-md ml-3"
                onClick={() => {
                  setSearchPerformed(false);
                  setSearchState({ view: "All" });
                  setSearchState({ prompt: "" });
                  setSearchState({ location: "Worldwide" });
                  setSearchState({ startDate: "" });
                  setSearchState({ endDate: "" });
                  setSearchState({ category: "" });
                  navigate("/");
                }}
              />
            </div>

            <nav className="space-y-2">
              <button
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} />
                <span>Search</span>
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
                onClick={() => setIsUploadOpen(!isUploadOpen)}
              >
                <Upload size={20} />
                <span>Upload</span>
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
                onClick={() => navigate("/my-groups")}
              >
                <Send size={20} />
                <span>My Groups</span>
              </button>

              <button
                onClick={() => {
                  if (loggedIn) {
                    navigate(`/profile/${user?.id}`);
                  } else {
                    navigate("/login");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <UserIcon size={20} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate(`/me`);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  navigate("/admin/events/create");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <Plus size={20} />
                <span>Create Event</span>
              </button>

              <button
                onClick={() => {
                  setShowUploads(!showUploads);
                  handleOnUpload();
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <Upload size={20} />
                <span>{showUploads ? "Hide My Events" : "My Events"}</span>
              </button>

              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <Smartphone size={20} />
                <span>Install App</span>
              </button>

              <button
                onClick={() => {
                  navigate("/about");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <Info size={20} />
                <span>About</span>
              </button>

              {!loggedIn ? (
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        </aside>

        {/* Hauptinhalt */}
        <div className="flex-1 md:ml-64">
          <main className="max-w-7xl mx-auto px-4 pb-20 md:pb-0">
            <div className="py-6">
              <CityBar
                onLocationSelect={handleLocationChange}
                selectedLocation={location}
              />
              <CategoryFilter
                prevDateRange={{
                  startDate: startDate ? new Date(startDate) : null,
                  endDate: endDate ? new Date(endDate) : null,
                }}
                events={favoriteEvents}
                viewMode={viewMode}
                category={category}
                onCategoryChange={handleCategoryChange}
                setDateRange={handleDateChange}
                onViewModeChange={handleViewChange}
              />
            </div>
            {loading ? (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            ) : searchPerformed && events.length === 0 ? (
              <div className="no-results mt-10">
                <div className="no-results-content text-center flex flex-col items-center justify-center">
                  <div className="no-results-icon text-7xl">🚫</div>
                  <h2 className="text-2xl font-bold mt-6">No Events Found</h2>
                </div>
              </div>
            ) : viewMode === "Home" ? (
              <EventPage
                favoriteEvents={favoriteEvents}
                feedItemsResponse={followedProfiles}
              />
            ) : (
              <EventPage
                favoriteEvents={events}
                feedItemsResponse={feedItemsResponse}
              />
            )}
          </main>
          <SearchModal
            prompt={prompt}
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSearch={handleSearch}
          />
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleOnUpload}
          />
          <Footer />
        </div>

        {/* Mobile Navigation Bar - sticky am unteren Rand */}
        <nav className="md:hidden sticky bottom-0 left-0 right-0 h-14 backdrop-blur-[30px] bg-[color:var(--color-neon-blue-dark)/80] border-t-[1px] border-t-[color:var(--color-neon-blue-light)] w-full z-50">
          <div className="flex justify-around items-center h-full w-full">
            <button
              onClick={() => {
                setViewMode("Home");
                setSearchState({ view: "Home" });
              }}
              className="flex items-center justify-center text-white p-2"
            >
              <Home size={22} />
            </button>

            <button
              onClick={() => {
                setViewMode("All");
                setSearchState({ view: "All" });
              }}
              className="flex items-center justify-center text-white p-2"
            >
              <Compass size={22} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center justify-center text-white p-2"
            >
              <Plus size={22} />
            </button>

            <button
              onClick={() => navigate("/my-groups")}
              className="flex items-center justify-center text-white p-2"
            >
              <MessageCircle size={22} />
            </button>

            <button
              onClick={() => {
                if (loggedIn) {
                  navigate(`/profile/${user?.id}`);
                } else {
                  navigate("/login");
                }
              }}
              className="flex items-center justify-center text-white p-2"
            >
              <UserIcon size={22} />
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

export default LandingPage;
