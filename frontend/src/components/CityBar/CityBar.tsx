import { MapPin } from "lucide-react";
import React, { useState } from "react";
import "./CityBar.css";

interface CityBarProps {
  onLocationSelect: (location: string) => void;
}

export const CityBar: React.FC<CityBarProps> = ({ onLocationSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Hier können wir später die API-Abfrage implementieren
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
        <MapPin size={60} className="city-bar-icon" />
        <input
          type="text"
          className="city-bar-input"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Location..."
        />
        {/* <Locate className="city-bar-icon" /> */}
      </div>
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
          <h4>Last Locations:</h4>
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
