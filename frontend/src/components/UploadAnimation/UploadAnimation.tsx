import React, { useEffect } from "react";
import "./UploadAnimation.css";

interface UploadAnimationProps {
  isUploading: boolean;
  progress: number;
  onClose?: () => void;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({
  isUploading,
  progress,
  onClose,
}) => {
  useEffect(() => {
    if (isUploading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isUploading]);

  if (!isUploading) {
    return null;
  }

  return (
    <div className="upload-container" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-lg transition-opacity duration-300">
        <div className="p-10 rounded-3xl w-96 text-center">
          {/* <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center text-4xl rocket-animation">
          <span role="img" aria-label="Rocket">🚀</span>
        </div> */}

          <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-white font-bold text-xl">
            🎉 Event wird hochgeladen... {progress}%
          </p>
          {progress === 100 && (
            <p className="text-white/80 mt-2">
              Klicken Sie irgendwo, um fortzufahren
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
