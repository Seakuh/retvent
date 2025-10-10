import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomBar } from "./BottomBar";
import { CategoryFilter } from "./components/CategoryFilter/CategoryFilter";
import { CityBar } from "./components/CityBar/CityBar";
import { EventPage } from "./components/EventPage/EventPage";
import { Trending } from "./components/Trending/Trending";
import { UserContext } from "./contexts/UserContext";
import Footer from "./Footer/Footer";
import { useClickOutside } from "./hooks/useClickOutside";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLandingPageData } from "./hooks/useLandingPageData";
import { HelmetMeta } from "./LandingPageHelmet";
import { useLandingSearch } from "./LandinSearchContext";
import { SearchPage } from "./pages/SearchPage";
import { SideBar } from "./SideBar";
import { ViewMode } from "./types/event";
import { UploadModal } from "./UploadModal/UploadModal";

function LandingPage() {
  const navigate = useNavigate();

  // Context
  const {
    location,
    startDate,
    endDate,
    category,
    prompt,
    view,
    setSearchState,
  } = useLandingSearch();
  const { user, loggedIn, setLoggedIn, favoriteEventIds } =
    useContext(UserContext);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>(view || "Trending");
  const [showMenu, setShowMenu] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Memoized search params to prevent unnecessary re-renders
  const searchParams = useMemo(
    () => ({
      location,
      startDate,
      endDate,
      category,
      prompt,
    }),
    [location, startDate, endDate, category, prompt]
  );

  // Custom hook for data fetching
  const {
    events,
    favoriteEvents,
    followedProfiles,
    feedItemsResponse,
    loading,
    performSearch,
  } = useLandingPageData({
    favoriteEventIds,
    loggedIn,
    searchParams,
  });

  // Event handlers with useCallback to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setViewMode("Trending");
    setSearchState({ view: "Trending" });
  }, [setLoggedIn, setSearchState]);

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setViewMode("Search");
      setSearchState({ prompt: searchTerm });
      setSearchPerformed(true);
      setIsSearchOpen(false);

      try {
        await performSearch(searchTerm);
      } catch (error) {
        console.error("Error searching events:", error);
      }
    },
    [performSearch, setSearchState]
  );

  const handleOnUpload = useCallback(() => {
    navigate("/admin/events");
  }, [navigate]);

  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setViewMode(view);

      if (view === "All") {
        setSearchState({
          prompt: "",
          category: "",
          view: "All",
          startDate: startDate || "",
          endDate: endDate || "",
        });
      } else {
        setSearchState({ view });
      }
    },
    [setSearchState, startDate, endDate]
  );

  const handleCategoryChange = useCallback(
    (category: string | null) => {
      setSearchState({
        category: category || "",
        startDate: startDate || "",
        endDate: endDate || "",
        prompt: prompt || "",
        location: location || "",
      });
    },
    [setSearchState, startDate, endDate, prompt, location]
  );

  const handleDateChange = useCallback(
    (dateRange: { startDate: Date | null; endDate: Date | null }) => {
      setSearchState({
        startDate: dateRange.startDate?.toISOString() || "",
        endDate: dateRange.endDate?.toISOString() || "",
      });
    },
    [setSearchState]
  );

  const handleLocationChange = useCallback(
    (location: string) => {
      setSearchState({ location });
    },
    [setSearchState]
  );

  const handleInstallClick = useCallback(() => {
    navigate("/install-app");
  }, [navigate]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearchOpen: useCallback(() => setIsSearchOpen(true), []),
    onViewChange: handleViewChange,
  });

  // Click outside handler for menu
  useClickOutside(showMenu, () => setShowMenu(false), {
    button: ".menu-button",
    container: ".menu-container",
  });

  // Memoize date range to prevent unnecessary re-renders
  const dateRange = useMemo(
    () => ({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }),
    [startDate, endDate]
  );

  // Memoize content based on view mode
  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="search-loading">
          <div className="search-spinner"></div>
        </div>
      );
    }

    if (searchPerformed && events.length === 0) {
      return (
        <div className="no-results mt-10">
          <div className="no-results-content text-center flex flex-col items-center justify-center">
            <div className="no-results-icon text-7xl">🚫</div>
            <h2 className="text-2xl font-bold mt-6">No Events Found</h2>
          </div>
        </div>
      );
    }

    switch (viewMode) {
      case "Home":
        return (
          <EventPage
            favoriteEvents={favoriteEvents}
            feedItemsResponse={followedProfiles}
          />
        );
      case "Search":
        return <SearchPage />;
      case "Trending":
        return (
          <Trending
            favoriteEvents={events}
            feedItemsResponse={feedItemsResponse}
          />
        );
      default:
        return (
          <EventPage
            favoriteEvents={events}
            feedItemsResponse={feedItemsResponse}
          />
        );
    }
  }, [
    loading,
    searchPerformed,
    events,
    viewMode,
    favoriteEvents,
    followedProfiles,
    feedItemsResponse,
  ]);

  return (
    <>
      <HelmetMeta />

      {/* Sidebar Desktop */}
      <div className="fixed left-0 top-0 h-screen w-64 z-50 hidden md:block">
        <SideBar
          setSearchPerformed={setSearchPerformed}
          setSearchState={setSearchState}
          setIsSearchOpen={setIsSearchOpen}
          isSearchOpen={isSearchOpen}
          isUploadOpen={isUploadOpen}
          setViewMode={setViewMode}
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

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Mobile Navigation */}
        <BottomBar
          setViewMode={handleViewChange}
          setSearchState={setSearchState}
          setIsUploadOpen={setIsUploadOpen}
          loggedIn={loggedIn}
          user={user}
          navigate={navigate}
        />

        <main className="max-w-7xl mx-auto md:pb-0">
          {viewMode !== "Search" && (
            <div className="py-6 px-4 top-0 z-50 bg-[color:var(--color-neon-blue-dark-2)]">
              <CityBar
                onLocationSelect={handleLocationChange}
                selectedLocation={location}
              />
              <CategoryFilter
                prevDateRange={dateRange}
                events={favoriteEvents}
                viewMode={viewMode}
                category={category}
                onCategoryChange={handleCategoryChange}
                setDateRange={handleDateChange}
                onViewModeChange={handleViewChange}
              />
            </div>
          )}

          {renderContent}
        </main>

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
