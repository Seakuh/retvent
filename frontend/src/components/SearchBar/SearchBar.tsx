import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Suche nach Events..."
          className="search-input"
        />
      </div>
      <button type="submit" className="search-button">
        Suchen
      </button>
    </form>
  );
};