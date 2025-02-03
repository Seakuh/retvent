import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { IoCalendarOutline, IoHeartOutline, IoShareSocialOutline, IoLocationOutline, IoTimeOutline, IoTicketOutline, IoGlobeOutline } from 'react-icons/io5';
import { Event } from '../types/event';

interface EventDetailProps {
  event: Event;
  onClose?: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl"
    >
      <div className="relative h-96">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-white mb-2 neon-text">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <IoCalendarOutline />
                {format(new Date(event.date), 'EEEE, MMMM do')}
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline />
                {format(new Date(event.date), 'h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <IoLocationOutline />
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">About this event</h2>
          <p className="text-white/80 leading-relaxed">{event.description}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full"
          >
            <IoTicketOutline />
            Get Tickets
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-full"
          >
            <IoGlobeOutline />
            Visit Website
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}; 