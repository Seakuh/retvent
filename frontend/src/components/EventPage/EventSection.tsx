import { List, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const filterOptionsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start drag if clicking directly on a button
    if ((e.target as HTMLElement).closest('.filter-option-btn')) {
      return;
    }
    if (!filterOptionsRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - filterOptionsRef.current.offsetLeft);
    setScrollLeft(filterOptionsRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !filterOptionsRef.current) return;
    const x = e.pageX - filterOptionsRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    
    // Only prevent default and scroll if movement is significant
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
      e.preventDefault();
      filterOptionsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setHasMoved(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHasMoved(false);
  };

  const checkScrollButtons = () => {
    if (!filterOptionsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = filterOptionsRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
    const element = filterOptionsRef.current;
    if (element) {
      element.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        element.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [filterOptions]);

  const scrollLeftHandler = () => {
    if (!filterOptionsRef.current) return;
    filterOptionsRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRightHandler = () => {
    if (!filterOptionsRef.current) return;
    filterOptionsRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <>
      <div className="popular-title-container">
        {filterOptions && filterOptions.length > 0 ? (
          <div className="popular-title-with-filter">
            <div className="filter-options-wrapper">
              {showLeftArrow && (
                <button
                  className="scroll-arrow scroll-arrow-left"
                  onClick={scrollLeftHandler}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div
                ref={filterOptionsRef}
                className={`filter-options ${isDragging ? "dragging" : ""} ${hasMoved ? "has-moved" : ""}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
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
              {showRightArrow && (
                <button
                  className="scroll-arrow scroll-arrow-right"
                  onClick={scrollRightHandler}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
            {/* {events.length > 0 && (
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
            )} */}
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
