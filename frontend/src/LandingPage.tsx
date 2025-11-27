import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomBar } from "./BottomBar";
import { FilterBar } from "./components/FilterBar/FilterBar";
import { EventPage } from "./components/EventPage/EventPage";
import { Trending } from "./components/Trending/Trending";
import { UserContext } from "./contexts/UserContext";
import Footer from "./Footer/Footer";
import { useClickOutside } from "./hooks/useClickOutside";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLandingPageData } from "./hooks/useLandingPageData";
import { useLandingPageHandlers } from "./hooks/useLandingPageHandlers";
import { HelmetMeta } from "./LandingPageHelmet";
import { useLandingSearch } from "./LandinSearchContext";
import { SearchPage } from "./pages/SearchPage";
import { SideBar } from "./SideBar";
import { ViewMode } from "./types/event";
import { UploadModal } from "./UploadModal/UploadModal";

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = () => (
  <div className="search-loading">
    <div className="search-spinner"></div>
  </div>
);

// ============================================================================
// NO RESULTS COMPONENT
// ============================================================================

const NoResults = () => (
  <div className="no-results mt-10">
    <div className="no-results-content text-center flex flex-col items-center justify-center">
      <div className="no-results-icon text-7xl">🚫</div>
      <h2 className="text-2xl font-bold mt-6">No Events Found</h2>
    </div>
  </div>
);

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================

/**
 * LandingPage Component
 *
 * Main entry point for the application
 * Handles event browsing, filtering, and user interactions
 *
 * Performance Optimizations:
 * - Debounced search queries (300ms)
 * - Request cancellation for fast filter changes
 * - Memoized content rendering
 * - Lazy loading of child components
 * - Separated concerns (handlers, data fetching, UI)
 */
function LandingPage() {
  const navigate = useNavigate();

  // ----------------------------------------------------------------------------
  // CONTEXT & SEARCH STATE
  // ----------------------------------------------------------------------------

  const {
    location,
    startDate,
    endDate,
    category,
    prompt,
    view,
    setSearchState,
  } = useLandingSearch();

  const { user, loggedIn, setLoggedIn, favoriteEventIds } = useContext(UserContext);

  // ----------------------------------------------------------------------------
  // LOCAL STATE
  // ----------------------------------------------------------------------------

  const [viewMode, setViewMode] = useState<ViewMode>(view || "Trending");
  const [showMenu, setShowMenu] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // ----------------------------------------------------------------------------
  // MEMOIZED VALUES
  // ----------------------------------------------------------------------------

  // Memoize search params to prevent unnecessary re-renders
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

  // Memoize date range for filter components
  const dateRange = useMemo(
    () => ({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }),
    [startDate, endDate]
  );

  // ----------------------------------------------------------------------------
  // DATA FETCHING (Optimized with debouncing & cancellation)
  // ----------------------------------------------------------------------------

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

  // ----------------------------------------------------------------------------
  // EVENT HANDLERS (Centralized in custom hook)
  // ----------------------------------------------------------------------------

  const {
    handleLogout,
    handleSearch,
    handleOnUpload,
    handleInstallClick,
    handleViewChange,
    handleCategoryChange,
    handleDateChange,
    handleLocationChange,
  } = useLandingPageHandlers({
    navigate,
    setLoggedIn,
    setViewMode,
    setSearchState,
    setSearchPerformed,
    setIsSearchOpen,
    performSearch,
    startDate,
    endDate,
    prompt,
    location,
  });

  // ----------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS
  // ----------------------------------------------------------------------------

  useKeyboardShortcuts({
    onSearchOpen: useCallback(() => setIsSearchOpen(true), []),
    onViewChange: handleViewChange,
  });

  // ----------------------------------------------------------------------------
  // CLICK OUTSIDE HANDLER
  // ----------------------------------------------------------------------------

  useClickOutside(showMenu, () => setShowMenu(false), {
    button: ".menu-button",
    container: ".menu-container",
  });

  // ----------------------------------------------------------------------------
  // CONTENT RENDERING (Memoized for performance)
  // ----------------------------------------------------------------------------

  const renderContent = useMemo(() => {
    // Show loading spinner while fetching data
    if (loading) {
      return <LoadingSpinner />;
    }

    // Show "no results" message if search returned empty
    if (searchPerformed && events.length === 0) {
      return <NoResults />;
    }

    // Render appropriate view based on current view mode
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

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <>
      {/* SEO Meta Tags */}
      <HelmetMeta />

      {/* Desktop Sidebar Navigation */}
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

      {/* Main Content Area */}
      <div className="md:ml-64">
        {/* Mobile Bottom Navigation */}
        <BottomBar
          setViewMode={handleViewChange}
          setSearchState={setSearchState}
          setIsUploadOpen={setIsUploadOpen}
          loggedIn={loggedIn}
          user={user}
          navigate={navigate}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto md:pb-0">
          {/* Filter Bar (City + Category) - Hidden in Search view */}
          {viewMode !== "Search" && (
            <FilterBar
              location={location}
              category={category}
              dateRange={dateRange}
              favoriteEvents={favoriteEvents}
              viewMode={viewMode}
              onLocationChange={handleLocationChange}
              onCategoryChange={handleCategoryChange}
              onDateChange={handleDateChange}
              onViewModeChange={handleViewChange}
            />
          )}

          {/* Dynamic Content Based on View Mode */}
          {renderContent}
        </main>

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleOnUpload}
        />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default LandingPage;
