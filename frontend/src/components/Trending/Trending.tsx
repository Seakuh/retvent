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

  // Map events to category based on tags and category field
  const mapEventToCategory = (event: Event): string[] => {
    const categories: string[] = [];
    const tags = event.tags?.map((tag) => tag?.toLowerCase()).filter(Boolean) || [];
    const category = event.category?.toLowerCase() || "";
    const title = event.title?.toLowerCase() || "";

    // Arts & Culture
    if (
      tags.some((tag) =>
        ["exhibition", "theater", "film", "literatur", "art", "museum", "gallery", "culture", "theatre"].includes(tag)
      ) ||
      category.includes("exhibition") ||
      category.includes("theater") ||
      category.includes("film") ||
      title.includes("exhibition") ||
      title.includes("theater") ||
      title.includes("film")
    ) {
      categories.push("arts-culture");
    }

    // Food & Drink
    if (
      tags.some((tag) =>
        ["tasting", "popup", "bar", "food", "drink", "restaurant", "culinary", "wine", "beer"].includes(tag)
      ) ||
      category.includes("food") ||
      category.includes("drink") ||
      title.includes("tasting") ||
      title.includes("popup")
    ) {
      categories.push("food-drink");
    }

    // Tech & Business
    if (
      tags.some((tag) =>
        ["meetup", "talk", "startup", "tech", "business", "networking", "conference", "workshop"].includes(tag)
      ) ||
      category.includes("tech") ||
      category.includes("business") ||
      title.includes("meetup") ||
      title.includes("startup")
    ) {
      categories.push("tech-business");
    }

    // Community & Social
    if (
      tags.some((tag) =>
        ["spieleabend", "stammtisch", "dating", "language", "exchange", "community", "social", "meetup"].includes(tag)
      ) ||
      category.includes("community") ||
      category.includes("social") ||
      title.includes("spieleabend") ||
      title.includes("stammtisch")
    ) {
      categories.push("community-social");
    }

    // Sports & Fitness
    if (
      tags.some((tag) =>
        ["run", "yoga", "klettern", "sport", "fitness", "gym", "workout", "marathon", "cycling"].includes(tag)
      ) ||
      category.includes("sport") ||
      category.includes("fitness") ||
      title.includes("run") ||
      title.includes("yoga")
    ) {
      categories.push("sports-fitness");
    }

    // Outdoors & Nature
    if (
      tags.some((tag) =>
        ["hike", "park", "trip", "outdoor", "nature", "camping", "hiking", "adventure"].includes(tag)
      ) ||
      category.includes("outdoor") ||
      title.includes("hike") ||
      title.includes("park")
    ) {
      categories.push("outdoors-nature");
    }

    // Workshops & Classes
    if (
      tags.some((tag) =>
        ["workshop", "class", "creative", "coding", "diy", "course", "lesson", "tutorial"].includes(tag)
      ) ||
      category.includes("workshop") ||
      category.includes("class") ||
      title.includes("workshop")
    ) {
      categories.push("workshops-classes");
    }

    // Family & Kids
    if (
      tags.some((tag) =>
        ["family", "kids", "children", "kid", "family-friendly"].includes(tag)
      ) ||
      category.includes("family") ||
      title.includes("family") ||
      title.includes("kids")
    ) {
      categories.push("family-kids");
    }

    // Wellness & Mindfulness
    if (
      tags.some((tag) =>
        ["wellness", "mindfulness", "meditation", "spa", "relaxation", "yoga", "zen"].includes(tag)
      ) ||
      category.includes("wellness") ||
      title.includes("wellness") ||
      title.includes("mindfulness")
    ) {
      categories.push("wellness-mindfulness");
    }

    // Gaming & Esports
    if (
      tags.some((tag) =>
        ["gaming", "esports", "game", "tournament", "gamer", "esport"].includes(tag)
      ) ||
      category.includes("gaming") ||
      category.includes("esports") ||
      title.includes("gaming")
    ) {
      categories.push("gaming-esports");
    }

    // Markets & Fairs
    if (
      tags.some((tag) =>
        ["market", "fair", "flohmarkt", "craft", "flea", "bazaar"].includes(tag)
      ) ||
      category.includes("market") ||
      category.includes("fair") ||
      title.includes("market") ||
      title.includes("fair")
    ) {
      categories.push("markets-fairs");
    }

    return categories;
  };

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

    // Group events by category
    const grouped = favoriteEvents.reduce((acc, event) => {
      const categories = mapEventToCategory(event);
      
      // Add event to all matching categories
      categories.forEach((category) => {
        if (!acc[category]) acc[category] = [];
        if (!acc[category].find((e) => e.id === event.id)) {
          acc[category].push(event);
        }
      });
      
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


  // Get available filter options (Trends + Categories)
  const filterOptions = useMemo(() => {
    const categories = [
      { value: "arts-culture", label: "#Arts & Culture", emoji: "🎭" },
      { value: "food-drink", label: "#Food & Drink", emoji: "🍷" },
      { value: "tech-business", label: "#Tech & Business", emoji: "💼" },
      { value: "community-social", label: "#Community & Social", emoji: "👥" },
      { value: "sports-fitness", label: "#Sports & Fitness", emoji: "🏃" },
      { value: "outdoors-nature", label: "#Outdoors & Nature", emoji: "🌲" },
      { value: "workshops-classes", label: "#Workshops & Classes", emoji: "🎨" },
      { value: "family-kids", label: "#Family & Kids", emoji: "👨‍👩‍👧" },
      { value: "wellness-mindfulness", label: "#Wellness & Mindfulness", emoji: "🧘" },
      { value: "gaming-esports", label: "#Gaming & Esports", emoji: "🎮" },
      { value: "markets-fairs", label: "#Markets & Fairs", emoji: "🛒" },
    ];
    
    const options = [{ value: "trends", label: "Trends", emoji: "🔥" }];
    categories.forEach((category) => {
      options.push(category);
    });
    return options;
  }, []);

  // Get events based on selected filter
  const filteredEvents = useMemo(() => {
    if (selectedFilter === "trends") {
      return trendsEvents;
    }
    // Get events for the selected category
    const categoryEvents = groupedEvents[selectedFilter] || [];
    // Sort by engagement score
    return categoryEvents.sort((a, b) => {
      const scoreA = (a.views || 0) + (a.commentCount || 0);
      const scoreB = (b.views || 0) + (b.commentCount || 0);
      return scoreB - scoreA;
    });
  }, [selectedFilter, trendsEvents, groupedEvents]);

  return (
    <div className="event-page-container">
      {/* <AdBanner /> */}
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
          title="Trends"
          events={filteredEvents}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>
    </div>
  );
};
