import React from 'react';
import './CategoryFilter.css';

const categories = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Party', emoji: '🎉' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Art', emoji: '🎨' },
  { name: 'Food', emoji: '🍔' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Education', emoji: '📚' },
  { name: 'Festival', emoji: '🎪' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Fitness', emoji: '💪' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Nature', emoji: '🌿' },
  { name: 'Photography', emoji: '📸' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Books', emoji: '📖' },
  { name: 'Movies', emoji: '🎬' },
  { name: 'Science', emoji: '🔬' },
  { name: 'Finance', emoji: '💰' },
  { name: 'Health', emoji: '🏥' },
  { name: 'DIY & Crafting', emoji: '✂️' },
  { name: 'Animals', emoji: '🐾' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Spirituality', emoji: '🧘' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'History', emoji: '🏛️' },
  { name: 'Startups', emoji: '🚀' },
  { name: 'Coding', emoji: '🖥️' },
  { name: 'Politics', emoji: '🗳️' },
  { name: 'Relationships', emoji: '💑' },
  { name: 'Mental Health', emoji: '🧠' },
  { name: 'Automotive', emoji: '🚗' },
  { name: 'Luxury', emoji: '💎' },
  { name: 'Minimalism', emoji: '🏡' },
  { name: 'Environment', emoji: '🌍' },
  { name: 'Parenting', emoji: '👶' },
  { name: 'Space', emoji: '🚀' },
  { name: 'Esports', emoji: '🎮🏆' }
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="category-filter">
      <button
        className={`category-button ${!selectedCategory ? 'active' : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        🌟 All
      </button>
      {categories.map((category) => (
        <button
          key={category.name}
          className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.name)}
        >
          {category.emoji} {category.name}
        </button>
      ))}
    </div>
  );
};