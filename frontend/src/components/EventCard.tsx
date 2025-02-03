import React from 'react';
import { motion } from 'framer-motion';
import { IoCalendarOutline, IoHeartOutline, IoShareSocialOutline, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    image: string;
    date: string;
    location: string;
    description: string;
    category: string;
  };
  isActive?: boolean;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isActive,
  onToggleFavorite,
  isFavorite 
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const addToCalendar = () => {
    const startTime = new Date(event.date).toISOString();
    const endTime = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString();
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime.replace(/[-:]/g, '')}/${endTime.replace(/[-:]/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1 : 0.9, 
        opacity: isActive ? 1 : 0.7,
        y: isActive ? 0 : 20
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="relative w-[90vw] h-[75vh] flex-shrink-0 mx-2 rounded-3xl overflow-hidden shadow-2xl"
    >
      <motion.img 
        src={event.image} 
        alt={event.title}
        className="w-full h-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: isActive ? 1 : 1.1 }}
        transition={{ duration: 0.4 }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
        {/* Category Badge */}
        <motion.div 
          className="absolute top-6 right-6"
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
            {event.category}
          </span>
        </motion.div>
        
        {/* Content Container */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-8"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Date and Location */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-white/80">
              <IoTimeOutline className="mr-2" />
              {format(new Date(event.date), 'MMM dd, HH:mm')}
            </div>
            <div className="flex items-center text-white/80">
              <IoLocationOutline className="mr-2" />
              {event.location}
            </div>
          </div>

          {/* Title and Description */}
          <h2 className="text-white text-3xl font-bold mb-3 neon-text">{event.title}</h2>
          <p className="text-white/70 mb-8 line-clamp-2 text-lg">{event.description}</p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 glass-effect rounded-full backdrop-blur-sm neon-shadow"
              onClick={addToCalendar}
            >
              <IoCalendarOutline className="text-white text-xl" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 glass-effect rounded-full backdrop-blur-sm neon-shadow"
              onClick={() => onToggleFavorite?.(event.id)}
            >
              <IoHeartOutline className={`text-xl ${isFavorite ? 'text-pink-500' : 'text-white'}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 glass-effect rounded-full backdrop-blur-sm neon-shadow"
              onClick={handleShare}
            >
              <IoShareSocialOutline className="text-white text-xl" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 