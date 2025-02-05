import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { IconCurrentLocation } from '@tabler/icons-react';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

const MARKER_EMOJI = '📍'; // oder alternativ: 📌

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationMap({ onLocationSelect, initialLocation }: LocationMapProps) {
  const [position, setPosition] = useState(initialLocation || { lat: 51.1657, lng: 10.4515 });
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    onLocationSelect(lat, lng);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    );
  };

  return (
    <div className="location-map-container">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        className="location-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <div 
          style={{ 
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            fontSize: '2rem',
            left: position.lat,
            top: position.lng
          }}
        >
          {MARKER_EMOJI}
        </div>
        <MapEvents onLocationSelect={handleLocationSelect} />
      </MapContainer>
      <button 
        className="current-location-button"
        onClick={getCurrentLocation}
        disabled={loading}
      >
        <IconCurrentLocation size={24} />
      </button>
    </div>
  );
} 