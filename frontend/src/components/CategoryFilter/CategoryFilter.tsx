import { Home, SlidersHorizontal, Telescope } from "lucide-react";
import React, { useRef, useState } from "react";
import { ViewMode } from "../../types/event";
import { Event } from "../../utils";
import { FilterBar } from "../SearchBarComponent/SearchBar";
import "./CategoryFilter.css";

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
  location: string;
  prompt: string;
  handleLocationChange: (location: string) => void;
  handleSearch: (searchTerm: string) => void;
  handleDateChange: (dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  favoriteEvents: Event[];
  startDate: string;
  endDate: string;
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
  favoriteEvents,
  setDateRange,
  prevDateRange,
  location,
  prompt,
  handleLocationChange,
  handleSearch,
  handleDateChange,
  startDate,
  endDate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  // Fillter expand collapse state
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  /**
   * Toggle the genre filter modal visibility
   */
  const toggleFilterModal = () => {
    setIsFilterExpanded(!isFilterExpanded);
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
      <div className="selection-bar-container">
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
        <button
          className={`category-button ${isFilterExpanded ? "active" : ""}`}
          onClick={() => {
            toggleFilterModal();
          }}
        >
          <SlidersHorizontal size={20} />
          Filter
        </button>
      </div>
      <div>
        {isFilterExpanded && (
          <div className="filter-bar-container">
            <FilterBar
              onLocationSelect={handleLocationChange}
              selectedLocation={location}
              handleSearch={handleSearch}
              prompt={prompt}
              setDateRange={handleDateChange}
              events={favoriteEvents}
              prevDateRange={{
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
