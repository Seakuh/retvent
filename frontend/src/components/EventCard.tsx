import React from 'react';
import { motion } from 'framer-motion';
import { IoCalendarOutline, IoHeartOutline, IoShareSocialOutline, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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
  const generateShareMessage = () => {
    const eventDate = format(new Date(event.date), 'EEEE, MMMM do');
    const eventTime = format(new Date(event.date), 'h:mm a');
    
    return `
🎉 ${event.title}

📅 ${eventDate}
⏰ ${eventTime}
📍 ${event.location}

${event.description}

Join me at this event! 
🔗 ${window.location.origin}/event/${event.id}
    `.trim();
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: generateShareMessage(),
      url: `${window.location.origin}/event/${event.id}`
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback
        await navigator.clipboard.writeText(shareData.text);
        toast.success('Link copied to clipboard!');
      }
    } else {
      // Fallback für Browser ohne Share API
      await navigator.clipboard.writeText(shareData.text);
      toast.success('Link copied to clipboard!');
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const calendarEvent = {
      title: event.title,
      description: event.description,
      location: event.location,
      start: startDate,
      end: endDate,
      url: `${window.location.origin}/event/${event.id}`
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '')}/${endDate.toISOString().replace(/[-:]/g, '')}&details=${encodeURIComponent(`${calendarEvent.description}\n\nEvent Link: ${calendarEvent.url}`)}&location=${encodeURIComponent(calendarEvent.location)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Datum nicht verfügbar';
      }
      return format(date, 'MMM dd, HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Datum nicht verfügbar';
    }
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
      className="relative w-[80vw] h-[60vh] flex-shrink-0 mx-2 rounded-2xl overflow-hidden shadow-2xl"
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
        
        {/* Content Container - angepasstes Padding */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-6"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Date and Location - kleinere Schrift */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center text-white/80 text-sm">
              <IoTimeOutline className="mr-1.5 text-base" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-white/80 text-sm">
              <IoLocationOutline className="mr-1.5 text-base" />
              {event.location}
            </div>
          </div>

          {/* Title and Description - optimierte Abstände */}
          <h2 className="text-white text-2xl font-bold mb-2 neon-text">{event.title}</h2>
          <p className="text-white/70 mb-6 line-clamp-2 text-base">{event.description}</p>
          
          {/* Action Buttons - vertikal */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass-effect rounded-full backdrop-blur-sm neon-shadow hover:bg-white/10 transition-colors"
              onClick={addToCalendar}
              title="Add to Calendar"
            >
              <IoCalendarOutline className="text-white text-lg" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass-effect rounded-full backdrop-blur-sm neon-shadow hover:bg-white/10 transition-colors"
              onClick={() => onToggleFavorite?.(event.id)}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <IoHeartOutline 
                className={`text-lg ${isFavorite ? 'text-pink-500' : 'text-white'}`}
              />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass-effect rounded-full backdrop-blur-sm neon-shadow hover:bg-white/10 transition-colors"
              onClick={handleShare}
              title="Share Event"
            >
              <IoShareSocialOutline className="text-white text-lg" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 