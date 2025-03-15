import { divIcon, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { MapEvent } from "../../utils";
import "./MapView.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

const calculateBoundsDistance = (bounds: LatLngBounds): number => {
  const center = bounds.getCenter();
  const northEast = bounds.getNorthEast();

  // Berechne die Distanz vom Zentrum zur Ecke in Kilometern
  const R = 6371; // Erdradius in km
  const lat1 = (center.lat * Math.PI) / 180;
  const lat2 = (northEast.lat * Math.PI) / 180;
  const lon1 = (center.lng * Math.PI) / 180;
  const lon2 = (northEast.lng * Math.PI) / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Runde auf die nächste ganze Zahl und füge einen kleinen Puffer hinzu
  return Math.ceil(distance) + 1;
};

interface MapState {
  center: [number, number];
  zoom: number;
  distance: number;
}

// Funktion zum Vergleich von zwei MapState-Objekten
const hasSignificantChange = (prev: MapState, current: MapState): boolean => {
  // Mindestabstand in km, der eine neue Abfrage auslöst
  const MIN_DISTANCE_CHANGE = 0.5;

  // Berechne die Entfernung zwischen altem und neuem Zentrum
  const R = 6371; // Erdradius in km
  const lat1 = (prev.center[0] * Math.PI) / 180;
  const lat2 = (current.center[0] * Math.PI) / 180;
  const lon1 = (prev.center[1] * Math.PI) / 180;
  const lon2 = (current.center[1] * Math.PI) / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const centerDistance = R * c;

  // Wenn sich das Zoom-Level geändert hat
  if (prev.zoom !== current.zoom) return true;

  // Wenn sich das Zentrum mehr als MIN_DISTANCE_CHANGE verschoben hat
  if (centerDistance > MIN_DISTANCE_CHANGE) return true;

  // Wenn sich der sichtbare Radius signifikant geändert hat (>20%)
  if (Math.abs(current.distance - prev.distance) / prev.distance > 0.2)
    return true;

  return false;
};

const MapController: React.FC<{
  onViewportChange: (center: [number, number]) => void;
}> = ({ onViewportChange }) => {
  const map = useMap();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleViewportChange = () => {
      const center = map.getCenter();
      onViewportChange([center.lat, center.lng]);
    };

    const debouncedUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleViewportChange, 300);
    };

    map.on("moveend", debouncedUpdate);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      map.off("moveend", debouncedUpdate);
    };
  }, [map, onViewportChange]);

  return null;
};

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    52.520008, 13.404954,
  ]);
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [isUpdatingEvents, setIsUpdatingEvents] = useState(false);
  const isInitialLoad = useRef(true);

  const loadNearbyEvents = useCallback(
    async (lat: number, lon: number, isInitial: boolean = false) => {
      try {
        setIsUpdatingEvents(true);

        const response = await fetch(
          `${API_URL}events/nearby/map?lat=${lat}&lon=${lon}&distance=${
            isInitial ? 100 : 25
          }&limit=${isInitial ? 300 : 50}`
        );

        if (!response.ok) throw new Error("Failed to fetch events");
        const newEvents: MapEvent[] = await response.json();

        if (newEvents.length === 0) {
          return;
        }

        setEvents((prevEvents) => {
          const existingIds = new Set(prevEvents.map((e) => e.id));
          const uniqueNewEvents = newEvents.filter(
            (event) => !existingIds.has(event.id)
          );
          return isInitial ? newEvents : [...prevEvents, ...uniqueNewEvents];
        });
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsUpdatingEvents(false);
        if (isInitial) {
          isInitialLoad.current = false;
        }
      }
    },
    []
  );

  const handleViewportChange = useCallback(
    (center: [number, number]) => {
      setMapCenter(center);
      if (!isInitialLoad.current) {
        loadNearbyEvents(center[0], center[1], false);
      }
    },
    [loadNearbyEvents]
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        loadNearbyEvents(latitude, longitude, true); // Initial load mit 300 Events
      },
      (error) => {
        console.error("Geolocation error:", error);
        const defaultLocation: [number, number] = [52.520008, 13.404954];
        setUserLocation(defaultLocation);
        setMapCenter(defaultLocation);
        loadNearbyEvents(defaultLocation[0], defaultLocation[1], true); // Initial load mit 300 Events
      }
    );
  }, []); // Nur beim ersten Laden ausführen

  const handleEventClick = (event: MapEvent) => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="map-wrapper">
      {isUpdatingEvents && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
            fontSize: "14px",
          }}
        >
          Aktualisiere Events...
        </div>
      )}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="map-container"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController onViewportChange={handleViewportChange} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>Dein Standort</Popup>
          </Marker>
        )}
        {events.map((event) => {
          const position: [number, number] = [
            event.location.coordinates[1],
            event.location.coordinates[0],
          ];

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
            <Marker key={event.id} position={position} icon={customIcon}>
              <Popup className="event-popup-container">
                <div
                  className="event-popup"
                  style={{
                    width: "200px",
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={`${event.imageUrl}?width=150&format=webp`} // WebP reduziert Größe erheblich
                    alt={event.title}
                    className="event-popup-image"
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginBottom: "8px",
                    }}
                    onClick={() => handleEventClick(event)}
                  />
                  <h3
                    style={{
                      margin: "8px 0",
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "1.2",
                    }}
                  >
                    {truncateTitle(event.title)}
                  </h3>
                  <p>{formatDate(event.startDate)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
