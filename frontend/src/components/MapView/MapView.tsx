import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Event } from '../../types/event';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


interface MapViewProps {
  onMarkerClick: (event: Event) => void;
}

const customIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const MapView: React.FC<MapViewProps> = ({ onMarkerClick }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Hole die aktuelle Geolocation des Nutzers
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        loadNearbyEvents(latitude, longitude);
        console.log('Geolocation:', latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setUserLocation([52.520008, 13.404954]); // Standard: Berlin
        loadNearbyEvents(52.520008, 13.404954);
      }
    );
  }, []);

  const loadNearbyEvents = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${API_URL}/events/nearby?lat=${lat}&lon=${lon}&maxDistance=10`
      );
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      console.info('Loaded events:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  return (
    <MapContainer center={userLocation ?? [52.520008, 13.404954]} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && (
        <Marker position={userLocation} icon={customIcon}>
          <Popup>📍 You are here</Popup>
        </Marker>
      )}
      {events.map((event) => (
        <Marker
          key={event._id}
          position={[
            event.latitude ?? 52.520008, 
            event.longitude ?? 13.404954
          ]}          icon={customIcon}
          eventHandlers={{ click: () => onMarkerClick(event) }}
        >
          <Popup>
            <div className="event-popup">
              <h3>{event.name}</h3>
              <p>{event.date}</p>
              <p>{event.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
