import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./UploadedEventCard.css";

interface UploadedEventCardProps {
  event: {
    name: string;
    date: string;
    location: string;
    description: string;
    imageUrl: string;
    category: string;
    price?: string;
    eventLat?: number | null;
    eventLon?: number | null;
    uploadLat?: number;
    uploadLon?: number;
    ticketUrl?: string | null;
  };
  onClose: () => void;
}

const UploadedEventCard: React.FC<UploadedEventCardProps> = ({ event, onClose }) => {
  // Leaflet Marker Icon
  const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="event-modal">
      <div className="event-card">
        {/* Schließen-Button */}
        <button className="close-button" onClick={onClose}>✖</button>

        {/* Event-Bild */}
        <img src={event.imageUrl} alt={event.name} className="event-image" />

        {/* Event-Details */}
        <div className="event-info">
          <h3 className="event-title">{event.name}</h3>
          <p className="event-date">📅 {event.date}</p>
          <p className="event-location">📍 {event.location}</p>
          <p className="event-description">{event.description}</p>
          <p className="event-category">🏷️ {event.category}</p>
          {event.price && <p className="event-price">💰 {event.price}</p>}
          {event.ticketUrl && (
            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="event-ticket">
              🎟️ Tickets kaufen
            </a>
          )}
        </div>

        {/* OpenStreetMap */}
        {event.uploadLat && event.uploadLon && (
          <MapContainer center={[event.uploadLat, event.uploadLon]} zoom={13} className="event-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[event.uploadLat, event.uploadLon]} icon={markerIcon}>
              <Popup>{event.name} - {event.location}</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default UploadedEventCard;
