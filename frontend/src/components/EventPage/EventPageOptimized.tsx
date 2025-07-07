import { Heart } from "lucide-react";
import { lazy, Suspense } from "react";
import { AdBanner } from "../../Advertisement/AdBanner/AdBanner";
import { FeedResponse } from "../../utils";
import ReelTile from "../EventGallery/ReelTile";
import { ExploreFeed } from "../Feed/ExploreFeed";
import "./EventPage.css";
import { EventSection } from "./EventSection";
import { useEventPageData } from "./useEventPageData";

// 🚀 Lazy load components for better performance
const LazyEventGalleryII = lazy(() =>
  import("../EventGallery/EventGalleryII").then((module) => ({
    default: module.EventGalleryII,
  }))
);

interface EventPageOptimizedProps {
  favoriteEventIds: string[];
  feedItemsResponse: FeedResponse[];
  eventPageParams?: {
    startDate?: string;
    endDate?: string;
    location?: string;
    category?: string;
    prompt?: string;
  };
}

export const EventPageOptimized = ({
  favoriteEventIds,
  feedItemsResponse,
  eventPageParams,
}: EventPageOptimizedProps) => {
  // 🚀 Use optimized hook with React Query caching
  const {
    favoriteEvents,
    trendsEvents,
    filteredGroupedEvents,
    isLoading,
    error,
  } = useEventPageData({
    favoriteEventIds,
    eventPageParams,
    feedItemsResponse,
  });

  // 🎯 Show loading state
  if (isLoading) {
    return (
      <div className="event-page-container">
        <AdBanner />
        <div className="loading-state">
          <div className="loading-spinner">🔄</div>
          <p>Loading your favorite events...</p>
        </div>
      </div>
    );
  }

  // 🚨 Show error state
  if (error) {
    return (
      <div className="event-page-container">
        <AdBanner />
        <div className="error-state">
          <div className="error-icon">❌</div>
          <p>Failed to load events. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-page-container">
      <AdBanner />
      <ReelTile events={favoriteEvents} direction="horizontal" />
      <ExploreFeed feedItemsResponse={feedItemsResponse} />

      {favoriteEvents.length === 0 && (
        <div className="no-liked-events">
          <Heart size={100} />
          No liked events for your search. <br></br>Explore and like some events
          :)
        </div>
      )}

      <div className="event-page-section-container">
        <EventSection title="🔥 Trends" events={trendsEvents} />

        <div className="event-page-trends-container">
          {/* 🚀 Optimized rendering with memoized data */}
          {filteredGroupedEvents.map(({ tag, events }) => (
            <div key={tag} className="event-page-section-container">
              <EventSection title={`#${tag}`} events={events} />
            </div>
          ))}
        </div>

        <div className="event-favorites-container">
          <Suspense fallback={<div>Loading gallery...</div>}>
            <LazyEventGalleryII events={favoriteEvents} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
