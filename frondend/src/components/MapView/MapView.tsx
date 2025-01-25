import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Event } from '../../types/event';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

interface MapViewProps {
  events: Event[];
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

export const MapView: React.FC<MapViewProps> = ({ events, onMarkerClick }) => {
  const eventsWithCoords = events.filter(event => event.latitude && event.longitude);
  const center = eventsWithCoords.length > 0
    ? [eventsWithCoords[0].latitude!, eventsWithCoords[0].longitude!]
    : [52.520008, 13.404954]; // Default to Berlin

  return (
    <MapContainer center={center as [number, number]} zoom={13} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {eventsWithCoords.map(event => (
        <Marker
          key={event.id}
          position={[event.latitude!, event.longitude!]}
          icon={customIcon}
          eventHandlers={{
            click: () => onMarkerClick(event)
          }}
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