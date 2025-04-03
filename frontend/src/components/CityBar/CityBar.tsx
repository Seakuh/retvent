import { MapPin, X } from "lucide-react";
import React, { useState } from "react";
import "./CityBar.css";
import CityBarModal from "./CityBarModal";
interface CityBarProps {
  onLocationSelect: (location: string) => void;
  selectedLocation: string;
}

export const CityBar: React.FC<CityBarProps> = ({
  onLocationSelect,
  selectedLocation,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchLocation = (value: string) => {
    onLocationSelect(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleSelect = (location: string) => {
    onLocationSelect(location);

    // Füge neue Suche zu den letzten Suchen hinzu
    const updatedSearches = [
      location,
      ...recentSearches.filter((s) => s !== location),
    ].slice(0, 5); // Behalte nur die letzten 5 Suchen

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  return (
    <div>
      <div className="city-bar-container" onClick={() => setIsModalOpen(true)}>
        <div>
          <div className="city-bar-input-container">
            <MapPin
              size={20}
              className="city-bar-icon"
              absoluteStrokeWidth={false}
            />
            <button type="button" className="city-bar-input-button">
              {selectedLocation}
            </button>
          </div>
          {isModalOpen && (
            <CityBarModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSearch={handleSearchLocation}
            />
          )}
        </div>
        {selectedLocation !== "Worldwide" && (
          <X
            size={20}
            className="city-bar-input-button-close"
            onClick={(e) => {
              e.stopPropagation();
              onLocationSelect("Worldwide");
            }}
          />
        )}
      </div>
    </div>
  );
};
