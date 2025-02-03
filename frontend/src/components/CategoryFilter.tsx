import React from 'react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
}

const categories: Category[] = [
  { id: "all", label: "All", emoji: "🌟" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "wellness", label: "Wellness", emoji: "💆" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "cafe", label: "Cafés", emoji: "☕" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "meetup", label: "Meetups", emoji: "👥" }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="py-3 px-4">
      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory">
        <div className="flex gap-2 px-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              className={`w-fit px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 snap-center
                ${selectedCategory === (category.id === "all" ? null : category.id)
                  ? "bg-blue-500/90 text-white border border-blue-400/50 shadow-lg shadow-blue-500/20"
                  : "bg-white/10 backdrop-blur-sm text-white/90 border border-white/10 hover:bg-white/20"
                } transition-all duration-300`}
              onClick={() => onSelectCategory(category.id === "all" ? null : category.id)}
            >
              <span className="text-sm">{category.emoji}</span>
              <span className="text-xs font-medium">
                {category.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}; 