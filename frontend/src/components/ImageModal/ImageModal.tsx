import React, { useState, useEffect } from "react";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.1;

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prevZoom) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta));
      return newZoom;
    });
  };

  useEffect(() => {
    // Verhindere Scrollen auf dem Body, wenn Modal geöffnet ist
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleWheelOnModal = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheelOnModal, { passive: false });
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheelOnModal);
    };
  }, [onClose]);

  const handleModalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Verhindere Scrollen auf dem Modal-Container
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="image-modal" 
      onClick={onClose}
      onWheel={handleModalWheel}
    >
      <button className="close-modal">✕</button>
      <img
        src={imageUrl}
        alt="Full size"
        className="modal-image"
        style={{
          transform: `scale(${zoom})`,
          transition: "transform 0.1s ease-out",
          cursor: zoom > MIN_ZOOM ? "zoom-out" : "zoom-in",
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      />
    </div>
  );
};
