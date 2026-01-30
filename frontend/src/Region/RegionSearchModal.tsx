import React, { useEffect, useRef, useState } from "react";
import { searchRegions } from "./service";
import { IRegion } from "../utils";
import "./RegionSearchModal.css";

interface RegionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion: (regionSlug: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const RegionSearchModal: React.FC<RegionSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRegion,
  inputRef: externalInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionSuggestions, setRegionSuggestions] = useState<IRegion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, inputRef]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (value.length > 0) {
      setIsLoading(true);
      try {
        const regions = await searchRegions(value);
        setRegionSuggestions(regions);
      } catch (error) {
        console.error("Error searching regions:", error);
        setRegionSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setRegionSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < regionSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && regionSuggestions[selectedIndex]) {
        const region = regionSuggestions[selectedIndex];
        onSelectRegion(region.slug);
      } else if (regionSuggestions.length > 0) {
        onSelectRegion(regionSuggestions[0].slug);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleRegionClick = (region: IRegion) => {
    onSelectRegion(region.slug);
  };

  if (!isOpen) return null;

  return (
    <div
      className="region-search-modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="region-search-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder="Search for regions..."
          className="region-search-input"
          autoFocus
        />
        {isLoading && (
          <div className="region-search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {regionSuggestions.length > 0 && (
          <ul className="region-search-suggestions-list">
            {regionSuggestions.map((region, index) => (
              <li
                key={`region-${region.id}`}
                className={index === selectedIndex ? "selected" : ""}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="region-search-suggestion-name">{region.name}</span>
                {region.country && (
                  <span className="region-search-suggestion-country">{region.country}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {searchTerm.length > 0 && regionSuggestions.length === 0 && !isLoading && (
          <div className="region-search-no-results">
            <p>No regions found</p>
          </div>
        )}
      </div>
    </div>
  );
};
