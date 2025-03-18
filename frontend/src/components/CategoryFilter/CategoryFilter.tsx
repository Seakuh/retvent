import React, { useEffect, useState } from "react";
import "./CategoryFilter.css";

interface Category {
  name: string;
  emoji: string;
}

const categories = [
  { name: "Music", emoji: "🎵" },
  { name: "Party", emoji: "🎉" },
  { name: "Sports", emoji: "⚽" },
  { name: "Art", emoji: "🎨" },
  { name: "Food", emoji: "🍔" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Tech", emoji: "💻" },
  { name: "Education", emoji: "📚" },
  { name: "Festival", emoji: "🎪" },
  { name: "Fitness", emoji: "💪" },
  { name: "Travel", emoji: "✈️" },
  { name: "Nature", emoji: "🌿" },
  { name: "Photography", emoji: "📸" },
  { name: "Fashion", emoji: "👗" },
  { name: "Books", emoji: "📖" },
  { name: "Movies", emoji: "🎬" },
  { name: "Science", emoji: "🔬" },
  { name: "Finance", emoji: "💰" },
  { name: "Health", emoji: "🏥" },
  { name: "DIY & Crafting", emoji: "✂️" },
  { name: "Animals", emoji: "🐾" },
  { name: "Spirituality", emoji: "🧘" },
  { name: "Comedy", emoji: "😂" },
  { name: "History", emoji: "🏛️" },
  { name: "Startups", emoji: "🚀" },
  { name: "Coding", emoji: "🖥️" },
  { name: "Politics", emoji: "🗳️" },
  { name: "Relationships", emoji: "💑" },
  { name: "Mental Health", emoji: "🧠" },
  { name: "Automotive", emoji: "🚗" },
  { name: "Luxury", emoji: "💎" },
  { name: "Minimalism", emoji: "🏡" },
  { name: "Environment", emoji: "🌍" },
  { name: "Parenting", emoji: "👶" },
  { name: "Space", emoji: "🚀" },
  { name: "Esports", emoji: "🎮🏆" },
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}events/categories`
      );
      const data = await response.json();
      // remove null values
      const filteredCategories = data.filter(
        (category: string) => category !== null
      );
      // remove duplicates and empty strings
      const uniqueCategories = filteredCategories.filter(
        (category: string) => category !== ""
      );
      setCategories(uniqueCategories);
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-filter">
      <button
        className={`category-button ${!selectedCategory ? "active" : ""}`}
        onClick={() => onCategoryChange(null)}
      >
        🌟 All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
