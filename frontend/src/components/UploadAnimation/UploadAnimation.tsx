import React from 'react';
import { motion } from 'framer-motion';

interface UploadAnimationProps {
  isUploading: boolean;
  progress: number;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({ isUploading, progress }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isUploading ? 1 : 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-lg"
    >
      <div className="p-10 rounded-3xl w-96 text-center">
        <motion.div
          className="w-28 h-28 mx-auto mb-6 flex items-center justify-center text-4xl"
          animate={{
            rotate: isUploading ? 360 : 0,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity },
          }}
        >
          <span role="img" aria-label="Rakete">🚀</span>
        </motion.div>

        <motion.div
          className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        <motion.p
          className="text-white font-bold text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          🎉 Event wird hochgeladen... {progress}%
        </motion.p>
      </div>
    </motion.div>
  );
};
