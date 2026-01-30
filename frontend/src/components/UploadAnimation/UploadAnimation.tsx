import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./UploadAnimation.css";

interface UploadAnimationProps {
  isUploading: boolean;
  progress: number;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({
  isUploading,
  progress,
}) => {
  useEffect(() => {
    if (isUploading) {
      // Verhindere Scrollen komplett
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
    } else {
      // Stelle Scrollen wieder her
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    }

    return () => {
      // Cleanup: Stelle alles wieder her
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [isUploading]);

  if (!isUploading) {
    return null;
  }

  const overlayContent = (
    <div className="upload-overlay">
      {/* Animierte Hintergrund-Effekte */}
      <div className="upload-bg-effects">
        <div className="upload-glow-orb upload-glow-1"></div>
        <div className="upload-glow-orb upload-glow-2"></div>
        <div className="upload-glow-orb upload-glow-3"></div>
      </div>

      {/* Hauptcontainer */}
      <div className="upload-container">
        {/* Upload Icon/Animation */}
        <div className="upload-icon-wrapper">
          <div className="upload-icon-ring upload-icon-ring-1"></div>
          <div className="upload-icon-ring upload-icon-ring-2"></div>
          <div className="upload-icon-core">
            <span className="upload-icon-emoji" role="img" aria-label="Upload">
              🚀
            </span>
          </div>
        </div>

        {/* Fortschrittsanzeige */}
        <div className="upload-progress-section">
          <div className="upload-progress-bar">
            <div
              className="upload-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="upload-progress-shine"></div>
          </div>
          <div className="upload-progress-text">
            <span className="upload-progress-percent">{progress}%</span>
            <span className="upload-progress-label">Event wird hochgeladen...</span>
          </div>
        </div>

        {/* Zusätzliche Info */}
        <p className="upload-info-text">
          Bitte warten, während dein Event hochgeladen wird
        </p>
      </div>
    </div>
  );

  // Rendere direkt im body mit Portal, um sicherzustellen, dass kein Container den z-index beeinflusst
  return createPortal(overlayContent, document.body);
};
