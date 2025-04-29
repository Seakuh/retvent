import { Calendar, Home, SlidersHorizontal, Telescope } from "lucide-react";
import React, { useRef, useState } from "react";
import { ViewMode } from "../../types/event";
import { categoriesToFilter } from "../../utils";
import "./CategoryFilter.css";
import { GenreModal } from "./GenreModal";
interface CategoryFilterProps {
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  onViewModeChange: (view: ViewMode) => void;
  viewMode: ViewMode;
}

interface CachedCategories {
  categories: string[];
  timestamp: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  category,
  onCategoryChange,
  onViewModeChange,
  viewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);

  const toggleGenreModal = () => {
    setShowGenreModal(!showGenreModal);
  };

  const onGenreSelect = (genre: string) => {
    if (genre == category) {
      onCategoryChange("");
      onViewModeChange("All");
    } else {
      onCategoryChange(genre);
    }
    setShowGenreModal(false);
  };

  return (
    <div className="category-filter" ref={containerRef}>
      <button
        className={`category-button ${viewMode === "Home" ? "active" : ""}`}
        onClick={() => {
          onViewModeChange("Home");
        }}
      >
        <Home size={20} />
        Home
      </button>
      <button
        className={`category-button ${viewMode === "All" ? "active" : ""}`}
        onClick={() => {
          onViewModeChange("All");
        }}
      >
        <Telescope size={20} />
        All
      </button>
      <button
        className={`category-button ${viewMode === "Filter" ? "active" : ""}`}
        onClick={() => {
          toggleGenreModal();
          onCategoryChange(category);
          onViewModeChange("Filter");
        }}
      >
        <SlidersHorizontal size={20} />
        Filter
      </button>
      <button
        className={`category-button ${viewMode === "Calendar" ? "active" : ""}`}
        onClick={() => {
          onCategoryChange(category);
          onViewModeChange("Calendar");
        }}
      >
        <Calendar size={20} />
        Date
      </button>
      {/* <button
        className={`category-button ${dateFilter ? "active" : ""}`}
        onClick={() => setDateFilter(!dateFilter)}
      >
        <Calendar size={20} />
        Date
      </button> */}
      {/* {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))} */}
      {showGenreModal && (
        <GenreModal
          genres={categoriesToFilter}
          onGenreSelect={onGenreSelect}
          selectedGenre={category}
        />
      )}
    </div>
  );
};
