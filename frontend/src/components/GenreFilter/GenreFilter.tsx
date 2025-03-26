import React, { useCallback, useEffect, useRef, useState } from "react";
import "./GenreFilter.css";

interface GenreFilterProps {
  onClose: () => void;
  onSelect: (selectedGenres: string[]) => void;
  genres: string[];
  initialSelectedGenres?: string[];
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  onClose,
  onSelect,
  initialSelectedGenres = [],
}) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialSelectedGenres
  );
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onSelect(selectedGenres);
      onClose();
    }, 300);
  }, [onSelect, onClose, selectedGenres]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }, []);

  return (
    <div className={`genre-filter-container ${isClosing ? "closing" : ""}`}>
      <div className="genre-filter-content" ref={containerRef}>
        <div className="genre-bubbles">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-bubble ${
                selectedGenres.includes(genre) ? "active" : ""
              }`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
