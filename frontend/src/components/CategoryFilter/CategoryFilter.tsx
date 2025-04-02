import { Home, SlidersHorizontal, Telescope } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { CACHE_DURATION_3 } from "../../utils";
import "./CategoryFilter.css";
import { GenreModal } from "./GenreModal";
interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onDateChange: (date: Date | null) => void;
  onShowDateFilter: (show: boolean) => void;
}

// Cache-Dauer in Millisekunden (z.B. 24 Stunden)

// Cache-Struktur
interface CachedCategories {
  categories: string[];
  timestamp: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);

  useEffect(() => {
    const fetchAndCacheCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}events/categories`
        );
        const data = await response.json();
        const filteredCategories = data
          .filter((category: string) => category !== null && category !== "")
          .map(
            (category: string) =>
              category.charAt(0).toUpperCase() + category.slice(1)
          )
          .filter(
            (category: string, index: number, self: string[]) =>
              self.indexOf(category) === index
          );

        // Cache speichern
        const cacheData: CachedCategories = {
          categories: filteredCategories,
          timestamp: Date.now(),
        };
        localStorage.setItem("eventCategories", JSON.stringify(cacheData));

        setCategories(filteredCategories);
      } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
        // Bei Fehler: Versuche Cache zu laden
        loadCachedCategories();
      }
    };

    const loadCachedCategories = () => {
      const cachedData = localStorage.getItem("eventCategories");
      if (cachedData) {
        const { categories: cachedCategories, timestamp }: CachedCategories =
          JSON.parse(cachedData);
        setCategories(cachedCategories);
      }
    };

    const checkAndUpdateCategories = () => {
      const cachedData = localStorage.getItem("eventCategories");

      if (!cachedData) {
        // Kein Cache vorhanden: Neue Daten laden
        fetchAndCacheCategories();
        return;
      }

      const { timestamp }: CachedCategories = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION_3;

      if (isExpired) {
        // Cache ist abgelaufen: Neue Daten laden
        fetchAndCacheCategories();
      } else {
        // Cache ist noch gültig: Cached Daten laden
        loadCachedCategories();
      }
    };

    checkAndUpdateCategories();

    // Optional: Periodisches Update im Hintergrund
    const intervalId = setInterval(checkAndUpdateCategories, CACHE_DURATION_3);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const selectedDate = localStorage.getItem("selectedDate");
    if (selectedDate) {
      setDateFilter(true);
    }
  }, []);

  const toggleGenreModal = () => {
    setShowGenreModal(!showGenreModal);
  };

  const onGenreSelect = (genre: string) => {
    if (genre == selectedCategory) {
      onCategoryChange("All");
    } else {
      onCategoryChange(genre);
    }
    setShowGenreModal(false);
  };

  return (
    <div className="category-filter" ref={containerRef}>
      <button
        className={`category-button ${
          selectedCategory === "Home" ? "active" : ""
        }`}
        onClick={() => onCategoryChange("Home")}
      >
        <Home size={20} />
        Home
      </button>
      <button
        className={`category-button ${
          selectedCategory === "All" ? "active" : ""
        }`}
        onClick={() => onCategoryChange("All")}
      >
        <Telescope size={20} />
        All
      </button>
      <button
        className={`category-button ${
          selectedCategory !== "Home" && selectedCategory !== "All"
            ? "active"
            : ""
        }`}
        onClick={toggleGenreModal}
      >
        <SlidersHorizontal size={20} />
        Filter
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
          genres={categories}
          onGenreSelect={onGenreSelect}
          selectedGenre={selectedCategory}
        />
      )}
    </div>
  );
};
