import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event, formatDate, getDaysUntilDate } from "../../utils";
import "./ReelTile.css";

interface ReelTileProps {
  events: Event[];
}

const ReelTile: React.FC<ReelTileProps> = ({ events }) => {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Zeige maximal 4 Events an
  const displayEvents = events.slice(0, 4);

  const handleImageLoad = (imageUrl: string) => {
    console.log(`🖼️ Image loaded: ${imageUrl}`); // Debug log
    setLoadedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  const handleImageError = (
    imageUrl: string,
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    console.log(`❌ Image failed to load: ${imageUrl}`); // Debug log
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    target.nextElementSibling?.classList.add("show-fallback");

    // Mark as loaded to remove spinner
    setLoadedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  // Debug: Log current loaded images
  useEffect(() => {
    console.log("📊 Currently loaded images:", loadedImages);
  }, [loadedImages]);

  return (
    <div className="reel-tile-container">
      <div className="reel-tile-grid">
        {displayEvents.map((event, index) => {
          const imageUrl = event.imageUrl;
          const isLoaded = imageUrl ? loadedImages[imageUrl] : false;

          return (
            <div key={event.id || index} className="reel-tile-item">
              <div
                onClick={() => {
                  navigate(`/reel/${event.id}`);
                }}
                className="reel-tile-image-container"
              >
                {imageUrl ? (
                  <img
                    src={`https://img.event-scanner.com/insecure/rs:fill:200:200/plain/${imageUrl}@webp`}
                    alt={event.title}
                    className={`reel-tile-image ${
                      isLoaded ? "loaded" : "loading"
                    }`}
                    loading="eager"
                    onLoad={() => handleImageLoad(imageUrl)}
                    onError={(e) => handleImageError(imageUrl, e)}
                  />
                ) : null}

                {/* Fallback Gradient */}
                <div
                  className={`reel-tile-fallback ${
                    !imageUrl ? "show-fallback" : ""
                  }`}
                  style={{
                    background:
                      "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                  }}
                />

                {/* Loading Spinner */}
                {imageUrl && !isLoaded && (
                  <div className="reel-tile-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}

                <div className="reel-tile-overlay">
                  <div className="reel-tile-content">
                    <h3 className="reel-tile-title">{event.title}</h3>
                    <p className="reel-tile-date">
                      {getDaysUntilDate(
                        formatDate(event.startDate as string)
                      ) === 0
                        ? "today"
                        : getDaysUntilDate(
                            formatDate(event.startDate as string)
                          ) === 1
                        ? "tomorrow"
                        : `in ${getDaysUntilDate(
                            formatDate(event.startDate as string)
                          )} days`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReelTile;
