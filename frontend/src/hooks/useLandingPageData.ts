import { useCallback, useEffect, useState } from "react";
import { fetchFavoriteEvents } from "../components/EventPage/service";
import {
  getLatestFeedAll,
  getLatestFeedByFollowing,
} from "../components/Feed/service";
import { searchEvents } from "../service";
import { Event, FeedResponse } from "../utils";

type SearchParams = {
  location?: string;
  category?: string;
  prompt?: string;
  startDate?: string;
  endDate?: string;
};

type UseLandingPageDataProps = {
  favoriteEventIds: string[];
  loggedIn: boolean;
  searchParams: SearchParams;
};

export const useLandingPageData = ({
  favoriteEventIds,
  loggedIn,
  searchParams,
}: UseLandingPageDataProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);
  const [feedItemsResponse, setFeedItemsResponse] = useState<FeedResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Memoize the search params to prevent unnecessary re-renders
  const { location, category, prompt, startDate, endDate } = searchParams;

  // Fetch all events based on search params
  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setLoading(true);
      try {
        const [allEvents, feedItems] = await Promise.all([
          searchEvents(
            location === "Worldwide" ? undefined : location,
            category,
            prompt,
            startDate,
            endDate
          ),
          getLatestFeedAll(),
        ]);

        if (isMounted) {
          if (Array.isArray(allEvents)) {
            setEvents([...allEvents].reverse());
          }
          setFeedItemsResponse(feedItems);
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [location, category, prompt, startDate, endDate]);

  // Fetch favorite events and followed profiles (only when logged in)
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!loggedIn || favoriteEventIds.length === 0) {
        setFavoriteEvents([]);
        setFollowedProfiles([]);
        return;
      }

      try {
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

        if (isMounted) {
          setFavoriteEvents(favorites);
          setFollowedProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [
    loggedIn,
    favoriteEventIds.join(","), // Stable dependency
    startDate,
    endDate,
    category,
    location,
    prompt,
  ]);

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

  return {
    events,
    favoriteEvents,
    followedProfiles,
    feedItemsResponse,
    loading,
    performSearch,
  };
};
