import React, { useEffect, useRef, useState } from "react";
import { popularLocationsByCountry } from "../../locations";
import "./CityBarModal.css";

interface CityBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
}

const CityBarModal: React.FC<CityBarModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Alle Städte in ein Array zusammenfassen
  const allLocations = Object.values(popularLocationsByCountry).flat();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchTerm("");
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (value.length > 0) {
      const filtered = allLocations
        .filter((location) =>
          location.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5); // Maximal 5 Vorschläge anzeigen
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onSearch(suggestions[selectedIndex]);
        onClose();
      } else if (searchTerm) {
        onSearch(searchTerm);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="city-bar-modal-overlay" onClick={onClose}>
      <div
        className="city-bar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder="Search for locations..."
          className="city-bar-input"
          autoFocus
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={index === selectedIndex ? "selected" : ""}
                onClick={() => {
                  onSearch(suggestion);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CityBarModal;
