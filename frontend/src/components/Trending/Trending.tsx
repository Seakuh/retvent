import { Heart } from "lucide-react";
import { lazy, useMemo, useState } from "react";
import { AdBanner } from "../../Advertisement/AdBanner/AdBanner";
import { Event, FeedResponse } from "../../utils";
import { CommunityList } from "../Community/CommunityList";
import { EventSection } from "../EventPage/EventSection";
import "./Trending.css";

// 🚀 Lazy load components for better performance
const LazyEventGalleryII = lazy(() =>
  import("../EventGallery/EventGalleryII").then((module) => ({
    default: module.EventGalleryII,
  }))
);

// 💾 Cache for expensive calculations
interface CachedCalculation {
  trendsEvents: Event[];
  groupedEvents: Record<string, Event[]>;
}
const calculationCache = new Map<string, CachedCalculation>();

export const Trending = ({
  favoriteEvents,
  feedItemsResponse,
}: {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("trends");

  // ⚡ Memoize expensive calculations
  const { trendsEvents, groupedEvents } = useMemo(() => {
    const cacheKey = `events_${favoriteEvents.length}_${favoriteEvents
      .map((e) => e.id)
      .join(",")}`;

    const cached = calculationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Sort trends events by views
    const trends = [...favoriteEvents].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    );

    // Group events by their highest engagement tag
    const grouped = favoriteEvents.reduce((acc, event) => {
      const tags =
        event.tags?.map((tag) => tag?.toLowerCase()).filter(Boolean) || [];

      // Find the tag with highest total engagement score
      let bestTag = tags[0] || "";
      let maxScore = 0;

      tags.forEach((tag) => {
        if (!tag) return; // Skip undefined tags
        if (!acc[tag]) acc[tag] = [];
        const tagScore = acc[tag].reduce(
          (sum, e) => sum + ((e.views || 0) + (e.commentCount || 0)),
          0
        );
        if (tagScore > maxScore) {
          maxScore = tagScore;
          bestTag = tag;
        }
      });

      // Only add event to its best matching tag
      if (bestTag && !acc[bestTag]?.find((e) => e.id === event.id)) {
        if (!acc[bestTag]) acc[bestTag] = [];
        acc[bestTag].push(event);
      }
      return acc;
    }, {} as Record<string, Event[]>);

    const result = { trendsEvents: trends, groupedEvents: grouped };
    calculationCache.set(cacheKey, result);

    // 🧹 Clean cache if it gets too large
    if (calculationCache.size > 50) {
      const firstKey = calculationCache.keys().next().value;
      if (firstKey) {
        calculationCache.delete(firstKey);
      }
    }

    return result;
  }, [favoriteEvents]);

  // 🎯 Memoize filtered and sorted grouped events
  const filteredGroupedEvents = useMemo(() => {
    return Object.entries(groupedEvents)
      .map(([tag, events]) => {
        // Sort by engagement score (views + comments)
        const sortedEvents = events.sort((a, b) => {
          const scoreA = (a.views || 0) + (a.commentCount || 0);
          const scoreB = (b.views || 0) + (b.commentCount || 0);
          return scoreB - scoreA;
        });

        return { tag, events: sortedEvents };
      })
      .filter(({ events }) => events.length >= 4); // Only show tags with at least 4 events
  }, [groupedEvents]);

  // Get available filter options (Trends + Tags)
  const filterOptions = useMemo(() => {
    const options = [{ value: "trends", label: "🔥 Trends" }];
    filteredGroupedEvents.forEach(({ tag }) => {
      options.push({ value: tag, label: `#${tag}` });
    });
    return options;
  }, [filteredGroupedEvents]);

  // Get events based on selected filter
  const filteredEvents = useMemo(() => {
    if (selectedFilter === "trends") {
      return trendsEvents;
    }
    const selectedTagGroup = filteredGroupedEvents.find(
      ({ tag }) => tag === selectedFilter
    );
    return selectedTagGroup ? selectedTagGroup.events : [];
  }, [selectedFilter, trendsEvents, filteredGroupedEvents]);

  return (
    <div className="event-page-container">
      <AdBanner />
      {/* <CommunityList /> */}
      {/* <ReelTile events={favoriteEvents} direction="horizontal" /> */}
      {favoriteEvents.length === 0 && (
        <div className="no-liked-events">
          <Heart size={100} />
          No liked events for your search. <br></br>Explore and like some events
          :)
        </div>
      )}
      <div className="event-page-section-container">
        <EventSection
          title="🔥 Trends"
          events={filteredEvents}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>
    </div>
  );
};
