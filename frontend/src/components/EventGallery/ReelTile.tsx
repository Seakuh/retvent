import React from "react";
import { useNavigate } from "react-router-dom";
import { Event, getDaysUntilDate } from "../../utils";
import "./ReelTile.css";
interface ReelTileProps {
  events: Event[];
}

const ReelTile: React.FC<ReelTileProps> = ({ events }) => {
  const navigate = useNavigate();
  // Zeige maximal 4 Events an
  const displayEvents = events.slice(0, 4);

  return (
    <div className="reel-tile-container">
      <div className="reel-tile-grid">
        {displayEvents.map((event, index) => (
          <div key={event.id || index} className="reel-tile-item">
            <div
              onClick={() => {
                navigate(`/reel/${event.id}`);
              }}
              className="reel-tile-image"
              style={{
                backgroundImage: event.imageUrl
                  ? `url(${event.imageUrl})`
                  : "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div className="reel-tile-overlay">
                <div className="reel-tile-content">
                  <h3 className="reel-tile-title">{event.title}</h3>
                  <p className="reel-tile-date">
                    in {getDaysUntilDate(event.startDate || "")} Tagen
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelTile;
