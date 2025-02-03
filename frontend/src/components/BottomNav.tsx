import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoHomeOutline, IoCompassOutline, IoPersonOutline } from 'react-icons/io5';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: IoHomeOutline, label: 'Home' },
    { path: '/explore', icon: IoCompassOutline, label: 'Explore' },
    { path: '/profile', icon: IoPersonOutline, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              className="relative flex flex-col items-center"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
            >
              <Icon 
                className={`text-2xl ${isActive ? 'text-primary' : 'text-gray-500'}`}
              />
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-12 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <span className={`text-xs mt-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}; 