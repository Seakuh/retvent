import { MapPin } from "lucide-react";
import React, { useState } from "react";
import "./CityBar.css";
import CityBarModal from "./CityBarModal";
interface CityBarProps {
  onLocationSelect: (location: string) => void;
}

export const CityBar: React.FC<CityBarProps> = ({ onLocationSelect }) => {
  const [searchTerm, setSearchTerm] = useState("Berlin");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearchLocation = (value: string) => {
    onLocationSelect(value);
    // API-Abfrage für Vorschläge implementieren
    const mockSuggestions = [
      `${value} City`,
      `${value} Downtown`,
      `${value} District`,
    ];
    setSuggestions(mockSuggestions);
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
    <div className="city-bar-container">
      <div className="city-bar-input-container">
        <MapPin size={45} className="city-bar-icon" />
        <button
          type="button"
          className="city-bar-input-button"
          onClick={() => setIsModalOpen(true)}
        >
          {searchTerm}
        </button>
      </div>
      {isModalOpen && (
        <CityBarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSearch={handleSearchLocation}
        />
      )}
      {searchTerm && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSelect(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {!searchTerm && recentSearches.length > 0 && (
        <div className="recent-searches">
          <h4>Letzte Standorte:</h4>
          <ul>
            {recentSearches.map((search, index) => (
              <li key={index} onClick={() => handleSelect(search)}>
                {search}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
