import React from 'react';

interface UploadAnimationProps {
  isUploading: boolean;
  progress: number;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({ isUploading, progress }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-lg transition-opacity duration-300 ${
        isUploading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-10 rounded-3xl w-96 text-center">
        <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center text-4xl rocket-animation">
          <span role="img" aria-label="Rocket">🚀</span>
        </div>

        <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-white font-bold text-xl">
          🎉 Event is uploading... {progress}%
        </p>
      </div>
    </div>
  );
};
