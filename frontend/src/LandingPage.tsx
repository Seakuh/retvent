import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomBar } from "./BottomBar";
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
import { SearchPage } from "./pages/SearchPage";
import { searchEvents } from "./service";
import { SideBar } from "./SideBar";
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
      {/* Sidebar Desktop - nur auf Desktop sichtbar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-50 hidden md:block">
        <SideBar
          setSearchPerformed={setSearchPerformed}
          setSearchState={setSearchState}
          setIsSearchOpen={setIsSearchOpen}
          isSearchOpen={isSearchOpen}
          isUploadOpen={isUploadOpen}
          showUploads={showUploads}
          setShowUploads={setShowUploads}
          handleOnUpload={handleOnUpload}
          handleInstallClick={handleInstallClick}
          handleLogout={handleLogout}
          loggedIn={loggedIn}
          user={user}
          setIsUploadOpen={setIsUploadOpen}
        />
      </div>

      {/* Hauptinhalt - mit responsivem Margin */}
      <div className="md:ml-64">
        {" "}
        {/* Margin nur auf Desktop */}
        {/* Mobile */}
        <BottomBar
          setViewMode={setViewMode}
          setSearchState={setSearchState}
          setIsUploadOpen={setIsUploadOpen}
          loggedIn={loggedIn}
          user={user}
          navigate={navigate}
        />
        <main className="max-w-7xl mx-auto md:pb-0">
          <div className="z-index-100000000000 py-6 px-4 top-0 z-50 bg-[color:var(--color-neon-blue-dark-2)]">
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
          ) : viewMode === "Search" ? (
            <SearchPage />
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
    </>
  );
}

export default LandingPage;
