import {
  Calendar,
  Flame,
  House,
  Loader2,
  SlidersHorizontal,
  Telescope,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ViewMode } from "../../types/event";
import { categoriesToFilter, Event } from "../../utils";
import { CalendarComponent } from "../EventDetail/components/Calendar/CalendarComponent";
import Onboarding from "../Onboarding/Onboarding";
import OnboardingRecommendations from "../Onboarding/OnboardingRecommendations";
import "./CategoryFilter.css";
import { GenreModal } from "./GenreModal";

/**
 * Props for the CategoryFilter component
 */
interface CategoryFilterProps {
  category: string | null;
  prevDateRange: { startDate: Date | null; endDate: Date | null } | null;
  onCategoryChange: (category: string | null) => void;
  setDateRange: (dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  onViewModeChange: (view: ViewMode) => void;
  viewMode: ViewMode;
  events: Event[];
}

/**
 * CategoryFilter Component
 *
 * Provides navigation controls for filtering and viewing events in different modes.
 * Manages state for genre/category filters and date range selection.
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  category,
  onCategoryChange,
  onViewModeChange,
  viewMode,
  events,
  setDateRange,
  prevDateRange,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  /**
   * Toggle the genre filter modal visibility
   */
  const toggleGenreModal = () => {
    setShowGenreModal(!showGenreModal);
  };

  /**
   * Handle date range selection from calendar
   */
  const handleDateSelect = (dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setShowDateModal(false);
    setDateRange(dateRange);
  };

  /**
   * Reset date filters and update view state accordingly
   */
  const handleDateReset = () => {
    setDateRange({ startDate: null, endDate: null });
    setShowDateModal(false);
  };

  /**
   * Handle category/genre selection
   */
  const handleGenreSelect = (genre: string) => {
    if (genre === category || genre === "") {
      onCategoryChange(null);
    } else {
      onCategoryChange(genre);
    }
    setShowGenreModal(false);
  };

  return (
    <div className="category-filter" ref={containerRef}>
      {/* Inspire button with star symbol */}
      {/* <button
        className={`category-button ${viewMode === "Inspire" ? "active" : ""}`}
        onClick={() => onViewModeChange("Inspire")}
      >
        <Sparkles
          size={20}
        />
        Inspire
      </button> */}
      {/* Home button */}
      <button
        className={`category-button ${viewMode === "Home" ? "active" : ""}`}
        onClick={() => onViewModeChange("Home")}
      >
        <House size={20} />
        Home
      </button>

      {/* All events button */}
      <button
        className={`category-button ${viewMode === "All" ? "active" : ""}`}
        onClick={() => onViewModeChange("All")}
      >
        <Telescope size={20} />
        Now
      </button>

      <button
        className={`category-button ${viewMode === "Trending" ? "active" : ""}`}
        onClick={() => onViewModeChange("Trending")}
      >
        <Flame size={20} />
        Trends
      </button>
      {/* Calendar/date filter button */}
      <button
        className={`category-button ${
          prevDateRange?.startDate ? "active" : ""
        }`}
        onClick={() => setShowDateModal(true)}
      >
        <Calendar size={20} />
        Date
      </button>

      {/* Filter by genre button */}
      <button
        className={`category-button ${category ? "active" : ""}`}
        onClick={() => {
          setShowOnboarding(true);
        }}
      >
        <SlidersHorizontal size={20} />
        Vibe
      </button>

      {/* Genre selection modal */}
      {showGenreModal && (
        <GenreModal
          genres={categoriesToFilter}
          onGenreSelect={handleGenreSelect}
          selectedGenre={category}
        />
      )}

      {/* Calendar date selection modal */}
      {showDateModal && (
        <CalendarComponent
          events={events}
          onClose={() => setShowDateModal(false)}
          setDateRange={handleDateSelect}
          prevDateRange={prevDateRange}
          onReset={handleDateReset}
        />
      )}

      {/* Onboarding modal */}
      {showOnboarding && (
        <Onboarding
          onContinueClick={() => {
            setIsLoadingRecommendations(true);
          }}
          onComplete={(events?: any[]) => {
            setShowOnboarding(false);
            
            // Process events
            setTimeout(() => {
              if (events && events.length > 0) {
                // Convert events to RecommendedEvent format
                const recommendedEventsData = events.map((event) => {
                  if (event.event) {
                    return event;
                  }
                  return {
                    event: event,
                    matchPercentage: event.matchPercentage || 100,
                  };
                });
                setRecommendedEvents(recommendedEventsData);
                setIsLoadingRecommendations(false);
                setShowRecommendations(true);
              } else {
                setIsLoadingRecommendations(false);
              }
            }, 500);
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setShowRecommendations(false);
            setIsLoadingRecommendations(false);
          }}
        />
      )}
      
      {/* Loading animation for recommendations */}
      {isLoadingRecommendations && 
        createPortal(
          <div className="onboarding-loading-overlay">
            <Loader2 className="onboarding-spinner-icon" size={48} />
          </div>,
          document.body
        )
      }
      
      {/* Onboarding Recommendations - rendered outside container using portal */}
      {showRecommendations && recommendedEvents.length > 0 && 
        createPortal(
          <OnboardingRecommendations
            events={recommendedEvents}
            onContinue={() => {
              setShowRecommendations(false);
            }}
          />,
          document.body
        )
      }
    </div>
  );
};
