import {
  Info,
  LogIn,
  LogOut,
  Menu,
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
import { EventGalleryII } from "./components/EventGallery/EventGalleryII";
import { EventPage } from "./components/EventPage/EventPage";
import { EventSection } from "./components/EventPage/EventSection";
import { fetchFavoriteEvents } from "./components/EventPage/service";
import { ExploreFeed } from "./components/Feed/ExploreFeed";
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
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // User Page
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
          setUserEvents(favoriteEvents);
          setFollowedProfiles(followedProfiles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, category, location, prompt, favoriteEventIds]);

  useEffect(() => {
    const searchQuery = prompt;
    const categoryQuery = category;
    const locationQuery = location;
    const startDateQuery = startDate;
    const endDateQuery = endDate;

    // const loadProfiles = async () => {
    //   const profiles = await searchProfiles();
    //   console.log("profiles", profiles);
    // };

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
  }, [location, category, prompt, startDate, endDate]);

  const handleInstallClick = async () => {
    navigate("/install-app");
  };

  return (
    <>
      <HelmetMeta />
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 backdrop-blur-[30px] bg-[color:var(--color-neon-blue-dark)/80] border-b-[1px] border-b-[color:var(--color-neon-blue-light)]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-8 h-8 rounded-md"
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

              <div className="flex items-center gap-4">
                <button
                  className="upload-icon"
                  onClick={() => {
                    setIsUploadOpen(!isUploadOpen);
                  }}
                >
                  <Upload size={24} color="white" />
                </button>

                <button
                  className="search-icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search size={24} color="white" />
                </button>
                <button
                  className="search-icon"
                  onClick={() => navigate("/my-groups")}
                >
                  <Send size={24} color="white" />
                </button>
                {/* <ViewToggle view={viewMode} onViewChange={setViewMode} /> */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg glass-effect text-white dark:text-white"
                  >
                    <Menu size={24} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 bg-blue-500">
                      {/* <button
                        onClick={() => {
                          navigate("/admin/dashboard");
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <Hexagon size={20} />
                        <h3>Dashboard</h3>
                      </button> */}

                      <button
                        onClick={() => {
                          if (loggedIn) {
                            navigate(`/profile/${user?.id}`);
                          } else {
                            navigate("/login");
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <UserIcon size={20} />
                        <h3>Profile</h3>
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/me`);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <Settings size={20} />
                        <h3>Settings</h3>
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
                          setShowUploads(!showUploads);
                          handleOnUpload();
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <Upload size={20} />
                        {showUploads ? "Hide My Events" : "My Events"}
                      </button>
                      <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <Smartphone size={20} />
                        <p>Install App</p>
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
                      {!loggedIn ? (
                        <button
                          onClick={() => {
                            navigate("/login");
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                        >
                          <LogIn size={20} />
                          <p>Login</p>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setLoggedIn(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                        >
                          <LogOut size={20} />
                          <p>Logout</p>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="px-4 py-6">
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
          ) : viewMode === "Home" ? (
            <EventPage
              favoriteEvents={favoriteEvents}
              feedItemsResponse={
                followedProfiles.length > 0
                  ? followedProfiles
                  : feedItemsResponse
              }
            />
          ) : (
            <div>
              <ExploreFeed feedItemsResponse={feedItemsResponse} />

              <h2 className="section-title">Popular</h2>
              <EventSection
                events={events.sort((a, b) => (b.views || 0) - (a.views || 0))}
              />
              <EventGalleryII title={category} events={events} />
            </div>
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
    </>
  );
}

export default LandingPage;
