import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFavoriteEvents } from "../components/EventPage/service";
import {
  getLatestFeedAll,
  getRecommendedEvents,
  getLatestFeedByFollowing,
} from "../components/Feed/service";
import { searchEvents } from "../service";
import { Event, FeedResponse } from "../utils";

// ============================================================================
// TYPES
// ============================================================================

type SearchParams = {
  location?: string;
  category?: string;
  prompt?: string;
  startDate?: string;
  endDate?: string;
};

type UseLandingPageDataProps = {
  favoriteEventIds: string[];
  recommendedEvents: Event[];
  loggedIn: boolean;
  searchParams: SearchParams;
};

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DEBOUNCE_DELAY = 300; // ms - Delay for search parameter changes

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useLandingPageData = ({
  favoriteEventIds,
  loggedIn,
  searchParams,
}: UseLandingPageDataProps) => {
  // ----------------------------------------------------------------------------
  // STATE
  // ----------------------------------------------------------------------------

  const [events, setEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);
  const [feedItemsResponse, setFeedItemsResponse] = useState<FeedResponse[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------------------
  // REFS - For debouncing and request cancellation
  // ----------------------------------------------------------------------------

  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Destructure search params for cleaner access
  const { location, category, prompt, startDate, endDate } = searchParams;

  // ----------------------------------------------------------------------------
  // EFFECT: Fetch events with debouncing and cancellation
  // ----------------------------------------------------------------------------

  useEffect(() => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the search to avoid too many requests
    debounceTimer.current = setTimeout(() => {
      let isMounted = true;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;


      const loadEvents = async () => {
        setLoading(true);

        try {
          // Only fetch feed if we have a valid location (for performance)
          const eventPromise = searchEvents(
            location === "Worldwide" ? undefined : location,
            category,
            prompt,
            startDate,
            endDate
          );

          // Load feed items in parallel only if needed
          const feedPromise = getLatestFeedAll();

          const [allEvents, feedItems] = await Promise.all([
            eventPromise,
            feedPromise,
          ]);

          // Check if request was cancelled
          if (abortController.signal.aborted || !isMounted) {
            return;
          }

          // Update state with results
          if (Array.isArray(allEvents)) {
            // Reverse order for chronological display (newest first)
            // Using reverse() directly is more efficient than [...array].reverse()
            setEvents(allEvents.slice().reverse());
          }

          setFeedItemsResponse(feedItems);
        } catch (err) {
          // Ignore abort errors
          if ((err as Error).name !== 'AbortError') {
            console.error("Error loading events:", err);
          }
        } finally {
          if (isMounted && !abortController.signal.aborted) {
            setLoading(false);
          }
        }
      };

      loadEvents();

      // Cleanup function
      return () => {
        isMounted = false;
        abortController.abort();
      };
    }, DEBOUNCE_DELAY);

    // Cleanup function for effect
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, category, prompt, startDate, endDate]);

  // ----------------------------------------------------------------------------
  // EFFECT: Fetch user-specific data (favorites & followed profiles)
  // ----------------------------------------------------------------------------

  useEffect(() => {
    // Early return if user is not logged in
    if (!loggedIn || favoriteEventIds.length === 0) {
      setFavoriteEvents([]);
      setFollowedProfiles([]);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const fetchUserData = async () => {
      try {
        // Fetch user favorites and followed profiles in parallel
        const [favorites, profiles] = await Promise.all([
          fetchFavoriteEvents(favoriteEventIds, {
            startDate,
            endDate,
            category,
            location: location === "Worldwide" ? undefined : location,
            prompt,
          }),
          getLatestFeedByFollowing(),
        ]);

        // Only update state if component is still mounted
        if (isMounted && !abortController.signal.aborted) {
          setFavoriteEvents(favorites);
          setFollowedProfiles(profiles);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [
    loggedIn,
    favoriteEventIds.join(","), // Stable dependency using join
    startDate,
    endDate,
    category,
    location,
    prompt,
  ]);

  // ----------------------------------------------------------------------------
  // CALLBACKS
  // ----------------------------------------------------------------------------

  /**
   * Performs a search with a specific search term
   * Used for explicit user searches (e.g., search bar input)
   */
  const performSearch = useCallback(
    async (searchTerm: string) => {
      setLoading(true);

      try {
        const searchResults = await searchEvents(
          location === "Worldwide" ? undefined : location,
          category,
          searchTerm,
          startDate,
          endDate
        );

        setEvents(searchResults as Event[]);
        return searchResults;
      } catch (error) {
        console.error("Error searching events:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [location, category, startDate, endDate]
  );

  // ----------------------------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------------------------

  return {
    events,
    favoriteEvents,
    followedProfiles,
    feedItemsResponse,
    loading,
    performSearch,
    recommendedEvents,
  };
};
