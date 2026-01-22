import { Heart, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Event, FeedResponse, categoriesToFilter } from "../../utils";
import { eventService } from "../../services/api";
import { EventSection } from "../EventPage/EventSection";
import "./Trending.css";
import { AdBanner } from "../../Advertisement/AdBanner/AdBanner";

// Category mapping with emojis
const categoryEmojiMap: Record<string, string> = {
  "Concert": "🎵",
  "Konzert": "🎵",
  "Workshop": "🎨",
  "Exhibition": "🎭",
  "Festival": "🎪",
  "Party": "🎉",
  "Event": "📅",
  "Theater": "🎭",
  "Market": "🛒",
  "Service": "🔧",
  "Rave": "🎧",
  "Community": "👥",
  "Comedy": "😂",
  "Social": "👥",
  "Dance": "💃",
  "Film": "🎬",
  "Demonstration": "📢",
  "Protest": "📢",
};

export const Trending = ({
  favoriteEvents,
}: {
  favoriteEvents: Event[];
  feedItemsResponse: FeedResponse[];
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("trends");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Get available filter options (Trends + Categories from categoriesToFilter)
  const filterOptions = useMemo(() => {
    const options = [{ value: "trends", label: "All", emoji: "🔥" }];
    
    categoriesToFilter.forEach((category) => {
      const emoji = categoryEmojiMap[category] || "📅";
      options.push({
        value: category.toLowerCase(),
        label: `#${category}`,
        emoji: emoji,
      });
    });
    
    return options;
  }, []);

  // Load events from API when filter changes
  useEffect(() => {
    const loadEvents = async () => {
      if (selectedFilter === "trends") {
        // For trends, use favoriteEvents sorted by views
        const trends = [...favoriteEvents].sort(
          (a, b) => (b.views || 0) - (a.views || 0)
        );
        setFilteredEvents(trends);
        return;
      }

      // For category filters, call the API
      setLoading(true);
      try {
        const category = categoriesToFilter.find(
          (cat) => cat.toLowerCase() === selectedFilter
        );
        
        if (category) {
          const events = await eventService.getPopularEventsByCategory(
            category,
            50
          );
          // Handle both array and object with events property
          const eventArray = Array.isArray(events) ? events : events.events || [];
          setFilteredEvents(eventArray);
        } else {
          setFilteredEvents([]);
        }
      } catch (error) {
        console.error("Error loading popular events by category:", error);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [selectedFilter, favoriteEvents]);

  return (
    <div className="event-page-container">
      {/* <CommunityList /> */}
      {/* <ReelTile events={favoriteEvents} direction="horizontal" /> */}
      <div className="event-page-section-container">
        <EventSection
          title="Trends"
          events={filteredEvents}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <Loader2 className="spinner-icon" size={48} />
            </div>
            <p className="loading-text">Loading events...</p>
          </div>
        )}
        {!loading && filteredEvents.length === 0 && selectedFilter !== "trends" && (
          <div className="no-liked-events">
            <Heart size={100} />
            No events found for this category. <br></br>Try another filter :)
          </div>
        )}
        {!loading && filteredEvents.length === 0 && selectedFilter === "trends" && (
          <div className="no-liked-events">
            <Heart size={100} />
            No liked events for your search. <br></br>Explore and like some events
            :)
          </div>
        )}
      </div>
    </div>
  );
};
