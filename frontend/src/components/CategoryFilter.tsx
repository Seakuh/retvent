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
  { id: "meetup", label: "Meetups", emoji: "👥" },
  { id: "Music",label: 'Music', emoji: '🎵' },
  { id: "Sports",label: 'Sports', emoji: '⚽' },
  { id: "Art",label: 'Art', emoji: '🎨' },
  { id: "Food",label: 'Food', emoji: '🍔' },
  { id: "Gaming",label: 'Gaming', emoji: '🎮' },
  { id: "Tech",label: 'Tech', emoji: '💻' },
  { id: "Education",label: 'Education', emoji: '📚' },
  { id: "Festival",label: 'Festival', emoji: '🎪' },
  { id: "Fitness",label: 'Fitness', emoji: '💪' },
  { id: "Travel",label: 'Travel', emoji: '✈️' },
  { id: "Nature",label: 'Nature', emoji: '🌿' },
  { id: "Photography",label: 'Photography', emoji: '📸' },
  { id: "Fashion",label: 'Fashion', emoji: '👗' },
  { id: "Books",label: 'Books', emoji: '📖' },
  { id: "Movies",label: 'Movies', emoji: '🎬' },
  { id: "Science",label: 'Science', emoji: '🔬' },
  { id: "Finance",label: 'Finance', emoji: '💰' },
  { id: "Health",label: 'Health', emoji: '🏥' },
  { id: "DIY",label: 'DIY & Crafting', emoji: '✂️' },
  { id: "Animals",label: 'Animals', emoji: '🐾' },
  { id: "Sports",label: 'Sports', emoji: '⚽' },
  { id: "Spirituality",label: 'Spirituality', emoji: '🧘' },
  { id: "Comedy",label: 'Comedy', emoji: '😂' },
  { id: "History",label: 'History', emoji: '🏛️' },
  { id: "Startups",label: 'Startups', emoji: '🚀' },
  { id: "Coding",label: 'Coding', emoji: '🖥️' },
  { id: "Politics",label: 'Politics', emoji: '🗳️' },
  { id: "Relationships",label: 'Relationships', emoji: '💑' },
  { id: "'MentalHeal",label: 'Mental Health', emoji: '🧠' },
  { id: "Automotive",label: 'Automotive', emoji: '🚗' },
  { id: "Luxury",label: 'Luxury', emoji: '💎' },
  { id: "Minimalism",label: 'Minimalism', emoji: '🏡' },
  { id: "Environment",label: 'Environment', emoji: '🌍' },
  { id: "Parenting",label: 'Parenting', emoji: '👶' },
  { id: "Space",label: 'Space', emoji: '🚀' },
  { id: "Esports",label: 'Esports', emoji: '🎮🏆' }


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