import React, { useState } from 'react';
import { Event } from '../../types/event';
import { EventCard } from '../EventCard';
import { motion } from 'framer-motion';
import './EventList.css';

interface EventListProps {
  events: Event[];
  onToggleFavorite: (eventId: string) => void;
  favorites: Set<string>;
  title?: string;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  onToggleFavorite, 
  favorites,
  title 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.9 + 16; // 90vw + margin
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  return (
    <div className="event-list-container mb-8">
      {title && (
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6 px-4 text-white neon-text"
        >
          {title}
        </motion.h2>
      )}
      
      <div 
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {events.map((event, index) => (
          <div key={event.id} className="snap-center">
            <EventCard 
              event={{
                id: event.id,
                title: event.name,
                image: event.imageUrl || '',
                date: event.date,
                location: event.location,
                description: event.description,
                category: event.category || 'Event'
              }}
              isActive={index === activeIndex}
            />
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {events.map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-white/30"
            animate={{
              scale: index === activeIndex ? 1.5 : 1,
              backgroundColor: index === activeIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};