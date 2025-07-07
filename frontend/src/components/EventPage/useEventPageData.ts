import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Event, FeedResponse } from "../../utils";
import { fetchFavoriteEvents } from "./service";

interface EventPageParams {
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  prompt?: string;
}

interface UseEventPageDataProps {
  favoriteEventIds: string[];
  eventPageParams?: EventPageParams;
  feedItemsResponse: FeedResponse[];
}

export const useEventPageData = ({
  favoriteEventIds,
  eventPageParams,
  feedItemsResponse,
}: UseEventPageDataProps) => {
  const queryClient = useQueryClient();

  // 🚀 React Query for favorite events with caching
  const {
    data: favoriteEvents = [],
    isLoading: isLoadingFavorites,
    error: favoritesError,
  } = useQuery({
    queryKey: ["favoriteEvents", favoriteEventIds, eventPageParams],
    queryFn: () => fetchFavoriteEvents(favoriteEventIds, eventPageParams),
    enabled: favoriteEventIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (new name for cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ⚡ Memoized calculations for performance
  const { trendsEvents, groupedEvents, filteredGroupedEvents } = useMemo(() => {
    const events = favoriteEvents as Event[];

    // Sort trends events by views
    const trends = [...events].sort(
      (a: Event, b: Event) => (b.views || 0) - (a.views || 0)
    );

    // Group events by their highest engagement tag
    const grouped = events.reduce(
      (acc: Record<string, Event[]>, event: Event) => {
        const tags =
          event.tags
            ?.map((tag: string) => tag?.toLowerCase())
            .filter(Boolean) || [];

        // Find the tag with highest total engagement score
        let bestTag = tags[0] || "";
        let maxScore = 0;

        tags.forEach((tag: string) => {
          if (!tag) return;
          if (!acc[tag]) acc[tag] = [];
          const tagScore = acc[tag].reduce(
            (sum: number, e: Event) =>
              sum + ((e.views || 0) + (e.commentCount || 0)),
            0
          );
          if (tagScore > maxScore) {
            maxScore = tagScore;
            bestTag = tag;
          }
        });

        // Only add event to its best matching tag
        if (bestTag && !acc[bestTag]?.find((e: Event) => e.id === event.id)) {
          if (!acc[bestTag]) acc[bestTag] = [];
          acc[bestTag].push(event);
        }
        return acc;
      },
      {} as Record<string, Event[]>
    );

    // Filter and sort grouped events
    const filtered = Object.entries(grouped)
      .map(([tag, events]) => {
        const sortedEvents = events.sort((a: Event, b: Event) => {
          const scoreA = (a.views || 0) + (a.commentCount || 0);
          const scoreB = (b.views || 0) + (b.commentCount || 0);
          return scoreB - scoreA;
        });
        return { tag, events: sortedEvents };
      })
      .filter(({ events }) => events.length >= 4);

    return {
      trendsEvents: trends,
      groupedEvents: grouped,
      filteredGroupedEvents: filtered,
    };
  }, [favoriteEvents]);

  // 🎯 Prefetch related data
  const prefetchRelatedData = () => {
    if (favoriteEvents.length > 0) {
      // Prefetch events by category
      const categories = [
        ...new Set(favoriteEvents.map((e) => e.category).filter(Boolean)),
      ];
      categories.forEach((category) => {
        queryClient.prefetchQuery({
          queryKey: ["events", category],
          queryFn: () =>
            fetchFavoriteEvents(favoriteEventIds, {
              ...eventPageParams,
              category,
            }),
          staleTime: 2 * 60 * 1000,
        });
      });
    }
  };

  return {
    favoriteEvents,
    trendsEvents,
    groupedEvents,
    filteredGroupedEvents,
    feedItemsResponse,
    isLoading: isLoadingFavorites,
    error: favoritesError,
    prefetchRelatedData,
  };
};
