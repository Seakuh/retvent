import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { IoLogInOutline, IoPersonAddOutline } from 'react-icons/io5';

const ProfileScreen: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-2xl font-bold text-white neon-text">
            Join the Community
          </h1>
          <p className="text-white/80">
            Sign in to create events and save your favorites
          </p>
        </motion.div>

        <div className="flex flex-col w-full max-w-xs gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 
                     bg-blue-500 text-white rounded-full shadow-lg 
                     hover:bg-blue-600 transition-all duration-300"
            onClick={() => window.location.href = '/auth/login'}
          >
            <IoLogInOutline className="text-xl" />
            Sign In
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 
                     bg-white/10 backdrop-blur-sm text-white rounded-full 
                     shadow-lg border border-white/20 hover:bg-white/20 
                     transition-all duration-300"
            onClick={() => window.location.href = '/auth/register'}
          >
            <IoPersonAddOutline className="text-xl" />
            Create Account
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
        >
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                          flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-white/80">{user?.email}</p>
            </div>
          </div>

          {/* Tabs für Events & Favoriten */}
          {/* ... Tab Implementation kommt als nächstes ... */}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;