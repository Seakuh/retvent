import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { popularLocationsByCountry } from "../../locations";
import { searchRegions } from "../../Region/service";
import { IRegion } from "../../utils";
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<IRegion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Alle Städte in ein Array zusammenfassen
  const allLocations = Object.values(popularLocationsByCountry).flat();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (value.length > 0) {
      // Suche nach Regionen
      try {
        const regions = await searchRegions(value);
        setRegionSuggestions(regions);

        // Fallback: Lokale Städte-Suche
        const filtered = allLocations
          .filter((location) =>
            location.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error searching regions:", error);
        // Fallback zu lokalen Städten
        const filtered = allLocations
          .filter((location) =>
            location.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5);
        setSuggestions(filtered);
      }
    } else {
      setSuggestions([]);
      setRegionSuggestions([]);
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
      const totalSuggestions = regionSuggestions.length + suggestions.length;
      if (selectedIndex >= 0 && selectedIndex < regionSuggestions.length) {
        // Region ausgewählt
        const region = regionSuggestions[selectedIndex];
        navigate(`/region/${region.slug}`);
        onClose();
      } else if (selectedIndex >= regionSuggestions.length && selectedIndex < totalSuggestions) {
        // Stadt ausgewählt
        const cityIndex = selectedIndex - regionSuggestions.length;
        onSearch(suggestions[cityIndex]);
        onClose();
      } else if (searchTerm) {
        // Wenn eine Region gefunden wird, zuerst Region versuchen
        if (regionSuggestions.length > 0) {
          navigate(`/region/${regionSuggestions[0].slug}`);
          onClose();
        } else {
          onSearch(searchTerm);
          onClose();
        }
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleRegionClick = (region: IRegion) => {
    navigate(`/region/${region.slug}`);
    onClose();
  };

  if (!isOpen) return null;

  const totalSuggestions = regionSuggestions.length + suggestions.length;

  return (
    <div
      className="city-bar-modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        console.log("clicked");
        onClose();
      }}
    >
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
        {(regionSuggestions.length > 0 || suggestions.length > 0) && (
          <ul className="suggestions-list">
            {regionSuggestions.map((region, index) => (
              <li
                key={`region-${region.id}`}
                className={index === selectedIndex ? "selected" : ""}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="suggestion-type">📍 Region:</span> {region.name}
              </li>
            ))}
            {suggestions.map((suggestion, index) => {
              const suggestionIndex = regionSuggestions.length + index;
              return (
                <li
                  key={`location-${index}`}
                  className={suggestionIndex === selectedIndex ? "selected" : ""}
                  onClick={() => {
                    onSearch(suggestion);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(suggestionIndex)}
                >
                  <span className="suggestion-type">🏙️ Stadt:</span> {suggestion}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CityBarModal;
