import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setRegionSuggestions([]);
      setSelectedIndex(-1);
      setIsLoading(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (value: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (value.length === 0) {
      setRegionSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const regions = await searchRegions(value, controller.signal);
      // Only update if request wasn't cancelled
      if (!controller.signal.aborted) {
        setRegionSuggestions(regions);
        setIsLoading(false);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name !== 'AbortError' && !controller.signal.aborted) {
        console.error("Error searching regions:", error);
        setRegionSuggestions([]);
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
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
      e.preventDefault();
      if (selectedIndex >= 0 && regionSuggestions[selectedIndex]) {
        const region = regionSuggestions[selectedIndex];
        onSelectRegion(region.slug);
        onClose();
      } else if (regionSuggestions.length > 0) {
        onSelectRegion(regionSuggestions[0].slug);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleRegionClick = (region: IRegion) => {
    onSelectRegion(region.slug);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="region-search-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
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
          placeholder="Region suchen..."
          className="region-search-input"
          autoFocus
        />
        {isLoading && (
          <div className="region-search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {!isLoading && regionSuggestions.length > 0 && (
          <ul className="region-search-suggestions-list">
            {regionSuggestions.map((region, index) => (
              <li
                key={`region-${region.id || region.slug || index}`}
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
        {!isLoading && searchTerm.length > 0 && regionSuggestions.length === 0 && (
          <div className="region-search-no-results">
            <p>Keine Regionen gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
};
