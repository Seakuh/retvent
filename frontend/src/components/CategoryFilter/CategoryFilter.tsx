import React, { useEffect, useRef, useState } from "react";
import "./CategoryFilter.css";

interface Category {
  name: string;
  emoji: string;
}

const categories = [
  { name: "Music", emoji: "🎵" },
  { name: "Concert", emoji: "🎤" },
  { name: "Exhibition", emoji: "🖼️" },
  { name: "Workshop", emoji: "🔧" },
  { name: "Konzert", emoji: "🎤" },
  { name: "Kunst", emoji: "🎨" },
  { name: "Event", emoji: "" },
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
  { name: "Nightlife", emoji: "🌃" },
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
  { name: "Film", emoji: "🎬" },
  { name: "Demonstration", emoji: "👩‍🎤" },
  { name: "Community", emoji: "👥" },
  { name: "Healthcare", emoji: "🏥" },
  { name: "Science", emoji: "🔬" },
  { name: "Parade", emoji: "👯‍♀️" },
  { name: "Fashion Show", emoji: "👗" },
  { name: "Art Show", emoji: "🖼️" },
  { name: "Food Festival", emoji: "🍔" },
  { name: "Music Festival", emoji: "🎵" },
  { name: "Film Festival", emoji: "🎬" },
  { name: "Comedy Festival", emoji: "😂" },
  { name: "Market", emoji: "🛍️" },
  { name: "Festival", emoji: "🎪" },
  { name: "Party", emoji: "🎉" },
  { name: "Sports", emoji: "⚽" },
  { name: "Art", emoji: "🎨" },
  { name: "Food", emoji: "🍔" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Theater", emoji: "🎭" },
  { name: "Dance", emoji: "💃" },
  { name: "Fashion Show", emoji: "👗" },
  { name: "Art Show", emoji: "🖼️" },
  { name: "Food Festival", emoji: "🍔" },
  { name: "Music Festival", emoji: "🎵" },
  { name: "Service", emoji: "💼" },
  { name: "Workshop", emoji: "🔧" },
  { name: "Konzert", emoji: "🎤" },
  { name: "Kunst", emoji: "🎨" },
  { name: "Event", emoji: "🎉" },
  { name: "Party", emoji: "🎉" },
  { name: "Rave", emoji: "💃" },
  { name: "Club", emoji: "🎉" },
  { name: "Bar", emoji: "🍸" },
  { name: "Pub", emoji: "🍻" },
  { name: "Club", emoji: "🎉" },
  { name: "Bar", emoji: "🍸" },
  { name: "Pub", emoji: "🍻" },
];

// Zuerst erstellen wir ein Mapping-Objekt aus dem vordefinierten categories Array
const categoryEmojiMap = categories.reduce(
  (acc, category) => ({
    ...acc,
    [category.name]: category.emoji,
  }),
  {} as Record<string, string>
);

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}events/categories`
      );
      const data = await response.json();
      const filteredCategories = data.filter(
        (category: string) => category !== null
      );
      const uniqueCategories = filteredCategories
        .filter((category: string) => category !== "")
        .map(
          (category: string) =>
            category.charAt(0).toUpperCase() + category.slice(1)
        )
        .filter(
          (category: string, index: number, self: string[]) =>
            self.indexOf(category) === index
        );
      setCategories(uniqueCategories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="category-filter" ref={containerRef}>
      <button
        className="category-button"
        onClick={() => onCategoryChange("Home")}
      >
        🏠Home
      </button>
      <button
        className={`category-button ${!selectedCategory ? "active" : ""}`}
        onClick={() => onCategoryChange("Home")}
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
          {categoryEmojiMap[category] || "❓"} {category}
        </button>
      ))}
    </div>
  );
};
