import React, { useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        className="search-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for location..."
          className="search-input"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(searchTerm);
            }
            if (e.key === "Escape") {
              onClose();
            }
          }}
        />
      </div>
    </div>
  );
};

export default CityBarModal;
