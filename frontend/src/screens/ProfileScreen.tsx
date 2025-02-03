import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { EventCard } from '../components/EventCard';
import { IoSettingsOutline } from 'react-icons/io5';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'likes' | 'created'>('likes');
  const [likedEvents, setLikedEvents] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);

  useEffect(() => {
    if (user) {
      // Lade gelikte Events
      fetch(`http://localhost:3145/events/liked/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => setLikedEvents(data))
        .catch(console.error);

      // Lade erstellte Events
      fetch(`http://localhost:3145/events/created/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => setCreatedEvents(data))
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="min-h-screen pb-20">
      {/* Profile Header */}
      <div className="p-4">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                            flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0].toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-white/80">{user?.email}</p>
                {user?.bio && <p className="text-white/60 mt-2">{user.bio}</p>}
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <IoSettingsOutline className="text-white text-xl" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 mt-4">
        <button
          onClick={() => setActiveTab('likes')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeTab === 'likes' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
        >
          Liked Events
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeTab === 'created' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
        >
          Created Events
        </button>
      </div>

      {/* Events Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'likes' ? likedEvents : createdEvents).map(event => (
          <EventCard
            key={event.id}
            event={event}
            isFavorite={true}
          />
        ))}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={(updatedUser) => {
          // Handle user update
        }}
      />
    </div>
  );
};

export default ProfileScreen;