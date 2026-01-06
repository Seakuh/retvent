import { List, Minus } from "lucide-react";
import { useState } from "react";
import { Event } from "../../utils";
import "./EventSection.css";
import { TrendsListView } from "./TrendsListView";

interface FilterOption {
  value: string;
  label: string;
  emoji?: string;
}

interface EventSectionProps {
  title?: string;
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

type ViewMode = "list" | "compact";

export const EventSection = ({
  title,
  events,
  filterOptions,
  selectedFilter,
  onFilterChange,
}: EventSectionProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <>
      <div className="popular-title-container">
        {filterOptions && filterOptions.length > 0 ? (
          <div className="popular-title-with-filter">
            <div className="filter-options">
              {filterOptions.map((option) => {
                const isActive = selectedFilter === option.value;
                const labelWithoutHash = option.label.replace(/^#/, "");
                const displayText = isActive && option.emoji
                  ? `${option.emoji} ${labelWithoutHash}`
                  : option.label;
                
                return (
                  <button
                    key={option.value}
                    className={`filter-option-btn ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => onFilterChange?.(option.value)}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
            {events.length > 0 && (
              <div className="view-toggle-container">
                <button
                  className="view-toggle-btn"
                  onClick={() => setViewMode(viewMode === "list" ? "compact" : "list")}
                  title={viewMode === "list" ? "Switch to Compact View" : "Switch to List View"}
                >
                  {viewMode === "list" ? (
                    <Minus size={20} />
                  ) : (
                    <List size={20} />
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="popular-title">{title}</h2>
            {events.length > 0 && (
              <button
                className="view-toggle-btn"
                onClick={() => setViewMode(viewMode === "list" ? "compact" : "list")}
                title={viewMode === "list" ? "Switch to Compact View" : "Switch to List View"}
              >
                {viewMode === "list" ? (
                  <Minus size={20} />
                ) : (
                  <List size={20} />
                )}
              </button>
            )}
          </>
        )}
      </div>
      {events.length > 0 && (
        <div className="event-list-container">
          {events.map((event, index) => (
            <div
              className="event-card-list-item"
              key={event.id || event._id}
            >
              <TrendsListView
                event={event}
                index={index}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
