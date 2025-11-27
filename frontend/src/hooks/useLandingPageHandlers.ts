import { useCallback } from "react";
import { NavigateFunction } from "react-router-dom";
import { ViewMode } from "../types/event";

// ============================================================================
// TYPES
// ============================================================================

interface UseLandingPageHandlersProps {
  navigate: NavigateFunction;
  setLoggedIn: (loggedIn: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSearchState: (state: any) => void;
  setSearchPerformed: (performed: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  performSearch: (searchTerm: string) => Promise<any>;
  startDate?: string;
  endDate?: string;
  prompt?: string;
  location?: string;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useLandingPageHandlers
 *
 * Centralizes all event handlers for the LandingPage component
 * Improves code organization and maintainability
 *
 * @returns Object containing all memoized event handlers
 */
export const useLandingPageHandlers = ({
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
}: UseLandingPageHandlersProps) => {

  // ----------------------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Handles user logout
   * Resets view to Trending and updates login state
   */
  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setViewMode("Trending");
    setSearchState({ view: "Trending" });
  }, [setLoggedIn, setViewMode, setSearchState]);

  // ----------------------------------------------------------------------------
  // SEARCH HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Handles search input submission
   * Updates view mode and triggers search
   */
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
    [performSearch, setSearchState, setViewMode, setSearchPerformed, setIsSearchOpen]
  );

  // ----------------------------------------------------------------------------
  // NAVIGATION HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Navigates to event upload/admin page
   */
  const handleOnUpload = useCallback(() => {
    navigate("/admin/events");
  }, [navigate]);

  /**
   * Navigates to app installation page
   */
  const handleInstallClick = useCallback(() => {
    navigate("/install-app");
  }, [navigate]);

  // ----------------------------------------------------------------------------
  // VIEW MODE HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Handles view mode changes (Trending, All, Home, Search)
   * Updates search state accordingly
   */
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
    [setSearchState, setViewMode, startDate, endDate]
  );

  // ----------------------------------------------------------------------------
  // FILTER HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Handles category filter changes
   * Preserves other filter values
   */
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

  /**
   * Handles date range changes
   * Converts Date objects to ISO strings for state management
   */
  const handleDateChange = useCallback(
    (dateRange: { startDate: Date | null; endDate: Date | null }) => {
      setSearchState({
        startDate: dateRange.startDate?.toISOString() || "",
        endDate: dateRange.endDate?.toISOString() || "",
      });
    },
    [setSearchState]
  );

  /**
   * Handles location/city changes
   */
  const handleLocationChange = useCallback(
    (location: string) => {
      setSearchState({ location });
    },
    [setSearchState]
  );

  // ----------------------------------------------------------------------------
  // RETURN ALL HANDLERS
  // ----------------------------------------------------------------------------

  return {
    // Authentication
    handleLogout,

    // Search
    handleSearch,

    // Navigation
    handleOnUpload,
    handleInstallClick,

    // View Mode
    handleViewChange,

    // Filters
    handleCategoryChange,
    handleDateChange,
    handleLocationChange,
  };
};
