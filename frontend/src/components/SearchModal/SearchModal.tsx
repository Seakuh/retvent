import React, { useEffect, useRef, useState } from "react";
import "./SearchModal.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  prompt: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  prompt,
}) => {
  const [searchTerm, setSearchTerm] = useState(prompt);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onOutsideClick = () => {
    setSearchTerm("");
    onSearch("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={() => onOutsideClick()}>
      <div
        className="search-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for events..."
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

export default SearchModal;
