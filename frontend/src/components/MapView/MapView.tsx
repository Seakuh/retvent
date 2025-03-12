import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { Event } from "../../utils";
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

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        loadNearbyEvents(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setUserLocation([52.520008, 13.404954]); // Standard: Berlin
        loadNearbyEvents(52.520008, 13.404954);
      }
    );
  }, []);

  const loadNearbyEvents = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}events/nearby?lat=${lat}&lon=${lon}&maxDistance=10`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      console.log("Received events from server:", data);
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    navigate(`/event/${event.id}`);
  };

  if (isLoading) {
    return <div className="loading">Lade Events...</div>;
  }

  return (
    <MapContainer
      center={userLocation ?? [52.520008, 13.404954]}
      zoom={13}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && (
        <Marker position={userLocation} icon={customIcon}>
          <Popup>📍</Popup>
        </Marker>
      )}
      {events.map((event) => {
        const position: [number, number] = [
          event.uploadLon ?? 52.520008,
          event.uploadLat ?? 13.404954,
        ];
        return (
          <Marker key={event.id} position={position} icon={customIcon}>
            <Popup>
              <div className="event-popup">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="event-popup-image"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-neon-blue)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEventClick(event)}
                />
                <h3>{event.title}</h3>
                <p>{new Date(event.startDate ?? "").toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
