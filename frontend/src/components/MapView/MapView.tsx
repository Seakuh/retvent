import { divIcon, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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
            ></Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

// Separate Popup-Komponente für bessere Übersichtlichkeit
// const EventPopup: React.FC<{
//   event: MapEvent;
//   onEventClick: () => void;
// }> = ({ event, onEventClick }) => {
//   const formatDate = (date: Date | string | undefined | null) => {
//     if (!date) return "";
//     const dateObj = typeof date === "string" ? new Date(date) : date;
//     return dateObj.toLocaleDateString("de-DE", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const truncateTitle = (title: string, maxLength: number = 30) => {
//     return title.length > maxLength
//       ? `${title.substring(0, maxLength)}...`
//       : title;
//   };

//   return (
//     <Popup className="event-popup-container">
//       <div className="event-popup">
//         <img
//           src={`${event.imageUrl}?width=150&format=webp`}
//           alt={event.title}
//           className="event-popup-image"
//           onClick={onEventClick}
//         />
//         <h3>{truncateTitle(event.title)}</h3>
//         <p>{formatDate(event.startDate)}</p>
//       </div>
//     </Popup>
//   );
// };
