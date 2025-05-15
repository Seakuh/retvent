import { Calendar, MapPin, Search, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Event } from "../../utils";
import { CalendarComponent } from "../EventDetail/components/Calendar/CalendarComponent";
import SearchModal from "../SearchModal/SearchModal";
import CityBarModal from "./CityBarModal";
import "./SearchBar.css";
// Types
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface SearchBarProps {
  onLocationSelect: (location: string) => void;
  selectedLocation: string;
  handleSearch: (searchTerm: string) => void;
  prompt: string;
  setDateRange: (dateRange: DateRange) => void;
  prevDateRange: DateRange;
  events: Event[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  selectedLocation,
  handleSearch,
  prompt,
  setDateRange,
  prevDateRange,
  events,
}) => {
  // State Management
  const [isLocationModalOpen, setIsLocationModalOpen] =
    useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] =
    useState<boolean>(false);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentLocations");
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * Handles location selection and updates recent locations
   * @param location - Selected location string
   */
  const handleLocationSelect = useCallback(
    (location: string) => {
      const formattedLocation =
        location.charAt(0).toUpperCase() + location.slice(1);
      onLocationSelect(formattedLocation);

      // Update recent locations
      const updatedLocations = [
        formattedLocation,
        ...recentLocations.filter((loc) => loc !== formattedLocation),
      ].slice(0, 5);

      setRecentLocations(updatedLocations);
      localStorage.setItem("recentLocations", JSON.stringify(updatedLocations));
    },
    [onLocationSelect, recentLocations]
  );

  /**
   * Handles date range selection from calendar
   * @param dateRange - Selected date range object
   */
  const handleDateRangeSelect = useCallback(
    (dateRange: DateRange) => {
      setDateRange(dateRange);
      setIsCalendarModalOpen(false);
    },
    [setDateRange]
  );

  /**
   * Resets date filters to default state
   */
  const handleDateRangeReset = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
    setIsCalendarModalOpen(false);
  }, [setDateRange]);

  /**
   * Resets location to worldwide
   */
  const handleLocationReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLocationSelect("Worldwide");
    },
    [onLocationSelect]
  );

  return (
    <div className="city-bar-wrapper">
      <div className="city-bar-container">
        <div className="city-bar-split">
          {/* Search Section */}
          <div
            className="city-bar-input-container"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search
              size={20}
              className="city-bar-icon"
              absoluteStrokeWidth={false}
            />
            <button type="button" className="city-bar-input-button">
              {prompt}
            </button>
          </div>

          <div className="city-bar-divider">|</div>

          {/* Location Section */}
          <div
            className="city-bar-input-container"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <MapPin
              size={20}
              className="city-bar-icon"
              absoluteStrokeWidth={false}
            />
            <button type="button" className="city-bar-input-button">
              {selectedLocation}
            </button>
          </div>

          <div className="city-bar-divider">|</div>

          {/* Calendar Section */}
          <div className="city-bar-input-container">
            <Calendar
              size={20}
              className="city-bar-icon"
              absoluteStrokeWidth={false}
            />
            <button
              type="button"
              className="calendar-bar-input-button"
              onClick={() => setIsCalendarModalOpen(true)}
            >
              {prevDateRange?.startDate?.toLocaleDateString() || "Today"}
            </button>
          </div>
        </div>

        {/* Location Reset Button */}
        {selectedLocation !== "Worldwide" && (
          <X
            size={20}
            className="city-bar-input-button-close"
            onClick={handleLocationReset}
          />
        )}
      </div>

      {/* Modals */}
      {isCalendarModalOpen && (
        <CalendarComponent
          events={events}
          onClose={() => setIsCalendarModalOpen(false)}
          setDateRange={handleDateRangeSelect}
          prevDateRange={prevDateRange}
          onReset={handleDateRangeReset}
        />
      )}

      {isSearchModalOpen && (
        <SearchModal
          prompt={prompt}
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleSearch}
        />
      )}

      {isLocationModalOpen && (
        <CityBarModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSearch={handleLocationSelect}
        />
      )}
    </div>
  );
};
