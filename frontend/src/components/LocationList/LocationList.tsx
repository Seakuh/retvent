import React from 'react';
import { motion } from 'framer-motion';
import { IoLocationOutline, IoStarOutline } from 'react-icons/io5';

interface Location {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  eventsCount: number;
  isFollowed?: boolean;
}

interface LocationListProps {
  locations: Location[];
  onToggleFollow: (locationId: string) => void;
  title?: string;
}

export const LocationList: React.FC<LocationListProps> = ({ 
  locations, 
  onToggleFollow,
  title 
}) => {
  return (
    <div className="mb-8">
      {title && (
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6 px-4 text-white neon-text"
        >
          {title}
        </motion.h2>
      )}
      
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            className="min-w-[280px] mx-2 snap-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
              <div className="relative h-40">
                <img 
                  src={location.imageUrl} 
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute top-4 right-4 p-2 rounded-full ${
                    location.isFollowed 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                  onClick={() => onToggleFollow(location.id)}
                >
                  <IoStarOutline className="text-xl" />
                </motion.button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{location.name}</h3>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">{location.description}</p>
                <div className="flex items-center text-white/60 text-sm">
                  <IoLocationOutline className="mr-1" />
                  <span>{location.eventsCount} Events</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 