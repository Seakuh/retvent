import { divIcon, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { MapEvent } from "../../utils";
import "./MapView.css";

const customIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userLocationIcon = divIcon({
  className: "pulse",
  iconSize: [14, 14],
  html: '<div class="user-location-icon"></div>',
});

// const calculateBoundsDistance = (bounds: LatLngBounds): number => {
//   const center = bounds.getCenter();
//   const northEast = bounds.getNorthEast();

//   // Berechne die Distanz vom Zentrum zur Ecke in Kilometern
//   const R = 6371; // Erdradius in km
//   const lat1 = (center.lat * Math.PI) / 180;
//   const lat2 = (northEast.lat * Math.PI) / 180;
//   const lon1 = (center.lng * Math.PI) / 180;
//   const lon2 = (northEast.lng * Math.PI) / 180;

//   const dLat = lat2 - lat1;
//   const dLon = lon2 - lon1;

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c;

//   // Runde auf die nächste ganze Zahl und füge einen kleinen Puffer hinzu
//   return Math.ceil(distance) + 1;
// };

// interface MapState {
//   center: [number, number];
//   zoom: number;
//   distance: number;
// }

// Funktion zum Vergleich von zwei MapState-Objekten
// const hasSignificantChange = (prev: MapState, current: MapState): boolean => {
//   // Mindestabstand in km, der eine neue Abfrage auslöst
//   const MIN_DISTANCE_CHANGE = 0.5;

//   // Berechne die Entfernung zwischen altem und neuem Zentrum
//   const R = 6371; // Erdradius in km
//   const lat1 = (prev.center[0] * Math.PI) / 180;
//   const lat2 = (current.center[0] * Math.PI) / 180;
//   const lon1 = (prev.center[1] * Math.PI) / 180;
//   const lon2 = (current.center[1] * Math.PI) / 180;

//   const dLat = lat2 - lat1;
//   const dLon = lon2 - lon1;

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const centerDistance = R * c;

//   // Wenn sich das Zoom-Level geändert hat
//   if (prev.zoom !== current.zoom) return true;

//   // Wenn sich das Zentrum mehr als MIN_DISTANCE_CHANGE verschoben hat
//   if (centerDistance > MIN_DISTANCE_CHANGE) return true;

//   // Wenn sich der sichtbare Radius signifikant geändert hat (>20%)
//   if (Math.abs(current.distance - prev.distance) / prev.distance > 0.2)
//     return true;

//   return false;
// };

// const MapController: React.FC<{
//   onViewportChange: (center: [number, number]) => void;
// }> = ({ onViewportChange }) => {
//   const map = useMap();
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleViewportChange = () => {
//       const center = map.getCenter();
//       onViewportChange([center.lat, center.lng]);
//     };

//     const debouncedUpdate = () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//       timerRef.current = setTimeout(handleViewportChange, 300);
//     };

//     map.on("moveend", debouncedUpdate);

//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//       map.off("moveend", debouncedUpdate);
//     };
//   }, [map, onViewportChange]);

//   return null;
// };

export interface MapViewProps {
  events: MapEvent[];
  selectedEvent: MapEvent | null;
  userLocation: [number, number];
  onEventSelect: (event: MapEvent) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  selectedEvent,
  userLocation,
  onEventSelect,
}) => {
  const navigate = useNavigate();
  const [map, setMap] = useState<any>(null);

  // Wenn sich selectedEvent ändert, zentriere die Karte auf das Event
  useEffect(() => {
    if (map && selectedEvent) {
      const position: [number, number] = [
        selectedEvent.location.coordinates[1],
        selectedEvent.location.coordinates[0],
      ];
      map.setView(position, 15);
    }
  }, [selectedEvent, map]);

  const handleEventClick = (event: MapEvent) => {
    onEventSelect(event);
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={userLocation}
        zoom={15}
        className="map-container"
        zoomControl={true}
        scrollWheelZoom={true}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>Dein Standort</Popup>
        </Marker>
        {events.map((event) => {
          const position: [number, number] = [
            event.location.coordinates[1],
            event.location.coordinates[0],
          ];

          // Spezielles Styling für ausgewähltes Event
          const isSelected = selectedEvent?.id === event.id;
          const markerIcon = isSelected
            ? new Icon({ ...customIcon.options, className: "selected-marker" })
            : customIcon;

          return (
            <Marker
              key={event.id}
              position={position}
              icon={markerIcon}
              eventHandlers={{
                click: () => handleEventClick(event),
              }}
            >
              {/* <EventPopup
                event={event}
                onEventClick={() => navigate(`/event/${event.id}`)}
              /> */}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

// Separate Popup-Komponente für bessere Übersichtlichkeit
const EventPopup: React.FC<{
  event: MapEvent;
  onEventClick: () => void;
}> = ({ event, onEventClick }) => {
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  return (
    <Popup className="event-popup-container">
      <div className="event-popup">
        <img
          src={`${event.imageUrl}?width=150&format=webp`}
          alt={event.title}
          className="event-popup-image"
          onClick={onEventClick}
        />
        <h3>{truncateTitle(event.title)}</h3>
        <p>{formatDate(event.startDate)}</p>
      </div>
    </Popup>
  );
};
