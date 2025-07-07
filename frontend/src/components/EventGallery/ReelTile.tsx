import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
import "./ReelTile.css";

interface ReelTileProps {
  events: Event[];
  direction?: "horizontal" | "vertical" | "grid";
}

const ReelTile: React.FC<ReelTileProps> = ({ events, direction = "grid" }) => {
  // 🎯 Moved default here
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Zeige maximal 4 Events an
  const displayEvents = events.slice(0, 4);

  // 🎯 Check if we have fewer than 4 events
  const hasFewEvents = displayEvents.length < 4;

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

  const getEventDateInfo = (startDate?: Date | string) => {
    if (!startDate) return { text: "no date", isPast: false };

    const eventDate = new Date(startDate);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let text: string;
    const isPast = diffDays < 0;

    if (diffDays === 0) {
      text = "today";
    } else if (diffDays === 1) {
      text = "tomorrow";
    } else if (diffDays === -1) {
      text = "yesterday";
    } else if (diffDays > 0) {
      text = `in ${diffDays} days`;
    } else {
      text = `${Math.abs(diffDays)} days ago`;
    }

    return { text, isPast };
  };

  return (
    <div className="reel-tile-container">
      <div
        className={`${
          direction === "grid" ? "reel-tile-grid" : "reel-tile-slider"
        } ${direction === "grid" && hasFewEvents ? "few-events" : ""}`}
      >
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
                    loading="lazy"
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
                    {(() => {
                      const dateInfo = getEventDateInfo(event.startDate);
                      return (
                        <p
                          className={`reel-tile-date ${
                            dateInfo.isPast ? "past" : ""
                          }`}
                        >
                          {dateInfo.text}
                        </p>
                      );
                    })()}
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
