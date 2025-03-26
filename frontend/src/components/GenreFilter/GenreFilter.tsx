import React, { useState } from "react";
import "./GenreFilter.css";

interface GenreFilterProps {
  onClose: () => void;
  onSelect: (selectedGenres: string[]) => void;
  genres: string[];
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  onClose,
  onSelect,
}) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSelect = () => {
    onSelect(selectedGenres);
    onClose();
  };

  return (
    <div className="genre-filter-container">
      <div className="genre-filter-content">
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
        <button className="select-button" onClick={handleSelect}>
          Select
        </button>
      </div>
    </div>
  );
};
