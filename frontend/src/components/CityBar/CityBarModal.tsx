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
    const value = e.target.value.trim();
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (value.length > 0) {
      const searchLower = value.toLowerCase();
      
      // Suche nach Regionen
      try {
        const regions = await searchRegions(value);
        // Filtere Regionen strikt - nur wenn der Suchbegriff am Anfang steht oder als Wort-Boundary
        const filteredRegions = regions.filter((region) => {
          const nameLower = region.name.toLowerCase();
          const slugLower = region.slug.toLowerCase();
          const countryLower = region.country?.toLowerCase() || "";
          
          // Escape special regex characters
          const escapedSearch = searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Prüfe ob der Suchbegriff am Anfang steht
          const nameStartsWith = nameLower.startsWith(searchLower);
          const slugStartsWith = slugLower.startsWith(searchLower);
          const countryStartsWith = countryLower.startsWith(searchLower);
          
          // Oder als Wort-Boundary (nach Leerzeichen, Bindestrich, etc.) - aber nicht mitten im Wort
          const nameWordMatch = nameLower.match(new RegExp(`(^|\\s|-|_)${escapedSearch}`, 'i'));
          const slugWordMatch = slugLower.match(new RegExp(`(^|\\s|-|_)${escapedSearch}`, 'i'));
          
          return nameStartsWith || slugStartsWith || countryStartsWith || nameWordMatch || slugWordMatch;
        });
        setRegionSuggestions(filteredRegions);

        // Lokale Städte-Suche - nur wenn am Anfang oder als Wort-Boundary
        const filtered = allLocations
          .filter((location) => {
            const locationLower = location.toLowerCase();
            if (locationLower === searchLower) return false;
            
            // Escape special regex characters
            const escapedSearch = searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Muss am Anfang stehen oder als Wort-Boundary
            const startsWith = locationLower.startsWith(searchLower);
            const wordMatch = locationLower.match(new RegExp(`(^|\\s|-|_)${escapedSearch}`, 'i'));
            return startsWith || wordMatch;
          })
          .slice(0, 5);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error searching regions:", error);
        // Fallback zu lokalen Städten - nur wenn am Anfang oder als Wort-Boundary
        const escapedSearch = searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const filtered = allLocations
          .filter((location) => {
            const locationLower = location.toLowerCase();
            if (locationLower === searchLower) return false;
            
            // Muss am Anfang stehen oder als Wort-Boundary
            const startsWith = locationLower.startsWith(searchLower);
            const wordMatch = locationLower.match(new RegExp(`(^|\\s|-|_)${escapedSearch}`, 'i'));
            return startsWith || wordMatch;
          })
          .slice(0, 5);
        setSuggestions(filtered);
        setRegionSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setRegionSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalSuggestions = regionSuggestions.length + suggestions.length;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < totalSuggestions - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
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
        } else if (suggestions.length > 0) {
          onSearch(suggestions[0]);
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
