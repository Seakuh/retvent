import { Home, SlidersHorizontal, Telescope } from "lucide-react";
import React, { useRef, useState } from "react";
import { ViewMode } from "../../types/event";
import { categoriesToFilter, Event } from "../../utils";
import { CalendarComponent } from "../EventDetail/components/Calendar/CalendarComponent";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

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
      {/* Home button */}
      <button
        className={`category-button ${viewMode === "Home" ? "active" : ""}`}
        onClick={() => onViewModeChange("Home")}
      >
        <Home size={20} />
        Home
      </button>

      {/* All events button */}
      <button
        className={`category-button ${viewMode === "All" ? "active" : ""}`}
        onClick={() => onViewModeChange("All")}
      >
        <Telescope size={20} />
        Explore
      </button>
      {/* Calendar/date filter button */}
      {/* <button
        className={`category-button ${
          prevDateRange?.startDate ? "active" : ""
        }`}
        onClick={() => setShowDateModal(true)}
      >
        <Calendar size={20} />
        Date
      </button> */}

      {/* Filter by genre button */}
      <button
        className={`category-button ${category ? "active" : ""}`}
        onClick={() => {
          toggleGenreModal();
        }}
      >
        <SlidersHorizontal size={20} />
        Filter
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
    </div>
  );
};
