import {
  Info,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Search,
  Send,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { CategoryFilter } from "./components/CategoryFilter/CategoryFilter";
import { CityBar } from "./components/CityBar/CityBar";
import { CalendarComponent } from "./components/EventDetail/components/Calendar/CalendarComponent";
import { EventGalleryII } from "./components/EventGallery/EventGalleryII";
import { EventPage } from "./components/EventPage/EventPage";
import { EventSection } from "./components/EventPage/EventSection";
import { ExploreFeed } from "./components/Feed/ExploreFeed";
import { getLatestFeedAll } from "./components/Feed/service";
import SearchModal from "./components/SearchModal/SearchModal";
import { UserContext } from "./contexts/UserContext";
import Footer from "./Footer/Footer";
import { useLandingSearch } from "./LandinSearchContext";
import { searchEvents } from "./service";
import { ViewMode } from "./types/event";
import { UploadModal } from "./UploadModal/UploadModal";
import { Event, FeedResponse } from "./utils";
function LandingPage() {
  // Search State
  const { location, date, category, prompt, view, setSearchState } =
    useLandingSearch();
  const [viewMode, setViewMode] = useState<ViewMode>(view || "All");
  const { user, loggedIn, setLoggedIn } = useContext(UserContext);
  // Event State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showUploads, setShowUploads] = useState(false);

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
      // if (e.ctrlKey && e.key.toLowerCase() === "f") {
      //   e.preventDefault();
      //   setViewMode("Filter");
      //   setSearchState({ view: "Filter" });
      // }
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
        searchTerm
      );
      console.log("searchResults", searchResults);
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
      setSearchState({ prompt: "", category: "", view: "All" });
      setViewMode("All");
    }
    setViewMode(view);
  };

  const handleCategoryChange = (category: string | null) => {
    console.log("category", category);
    setSearchState({ category: category || "" });
    setViewMode("Filter");
  };

  const handleLocationChange = (location: string) => {
    setSearchState({ location });
  };

  useEffect(() => {
    const searchQuery = prompt;
    const categoryQuery = category;
    const locationQuery = location;
    const startDateQuery = date;
    const endDateQuery = date;

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
  }, [location, category, prompt]);

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

  const HelmetMeta = () => {
    return (
      <Helmet>
        <title>EventScanner</title>
        <meta name="description" content="EventScanner" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

        <title>EventScanner - Discover Events everywhere</title>
        <meta
          name="description"
          content="Find the best events in your city with EventScanner! Get real-time updates, interactive maps, and personalized recommendations for concerts, festivals, and more."
        />
        <meta
          name="keywords"
          content="events, live events, concerts, parties, city events, festivals, open air, event finder, local events, entertainment"
        />
        <meta name="author" content="EventScanner Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://event-scanner.com/" />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="EventScanner" />

        <meta property="og:site_name" content="EventScanner" />
        <meta
          property="og:title"
          content="EventScanner - Discover Amazing Events Near You"
        />
        <meta
          property="og:description"
          content="Find the best events in your city! Get real-time updates, interactive maps, and personalized recommendations for an unforgettable experience."
        />
        <meta
          property="og:image"
          content="https://event-scanner.com/social-share.png"
        />
        <meta property="og:url" content="https://event-scanner.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="EventScanner App Preview" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eventscanner" />
        <meta
          name="twitter:title"
          content="EventScanner - Your Ultimate Event Discovery Platform"
        />
        <meta
          name="twitter:description"
          content="Find the best events in your city! Get real-time updates, interactive maps, and personalized recommendations for an unforgettable experience."
        />
        <meta
          name="twitter:image"
          content="https://event-scanner.com/social-share.png"
        />
      </Helmet>
    );
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
                    setSearchState({ date: "" });
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
                          navigate(`/me`);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <UserIcon size={20} />
                        <h3>Profile</h3>
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
                      {/* <button
                        onClick={() => {
                          navigate("/liked");
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
                      >
                        <Heart size={20} />
                        <p>Liked Events</p>
                      </button> */}
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
          {/* {showDateFilter && <DateFilter />} */}
          <div className="px-4 py-6">
            {/* <div>
              <EventScanner />
            </div> */}
            <CityBar
              onLocationSelect={handleLocationChange}
              selectedLocation={location}
            />
            <CategoryFilter
              viewMode={viewMode}
              category={category}
              onCategoryChange={handleCategoryChange}
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
            <EventPage />
          ) : viewMode === "Calendar" ? (
            <CalendarComponent
              events={events}
              onClose={() => {
                setViewMode("All");
              }}
            />
          ) : (
            <div>
              <ExploreFeed feedItemsResponse={feedItemsResponse} />

              <h2 className="section-title">Popular</h2>
              <EventSection
                events={events.sort((a, b) => (b.views || 0) - (a.views || 0))}
              />
              <EventGalleryII
                title={category}
                events={events}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          )}
          {/* {showUploads && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-white">
                Meine hochgeladenen Events
              </h2>
              {userEvents.length === 0 ? (
                <p className="text-white">
                  Keine hochgeladenen Events gefunden.
                </p>
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
          )} */}
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
