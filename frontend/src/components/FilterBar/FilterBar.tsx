import { memo } from "react";
import { CategoryFilter } from "../CategoryFilter/CategoryFilter";
import { CityBar } from "../CityBar/CityBar";
import { Event } from "../../utils";
import { ViewMode } from "../../types/event";

// ============================================================================
// TYPES
// ============================================================================

interface FilterBarProps {
  location: string;
  category: string;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  favoriteEvents: Event[];
  viewMode: ViewMode;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string | null) => void;
  onDateChange: (dateRange: { startDate: Date | null; endDate: Date | null }) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FilterBar Component
 *
 * Combines location (city) and category filters into a single component
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const FilterBar = memo(({
  location,
  category,
  dateRange,
  favoriteEvents,
  viewMode,
  onLocationChange,
  onCategoryChange,
  onDateChange,
  onViewModeChange,
}: FilterBarProps) => {
  return (
    <div className="py-6 px-4 top-0 z-50 bg-[color:var(--color-neon-blue-dark-2)]">
      {/* Location Selection */}
      <CityBar
        onLocationSelect={onLocationChange}
        selectedLocation={location}
      />

      {/* Category & Date Filters */}
      <CategoryFilter
        prevDateRange={dateRange}
        events={favoriteEvents}
        viewMode={viewMode}
        category={category}
        onCategoryChange={onCategoryChange}
        setDateRange={onDateChange}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
