
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchEvents, fetchCoordinates, fetchMockEvents } from "./service";
import { Search } from "lucide-react";
import "./MapScreen.css";
import { Event } from "../types/event";
import EventCard from "../components/EventCard/EventCard";

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setLocation({ lat: 9.7312, lon: 99.9915 });
      }
    );
  }, []);

  useEffect(() => {
    if (location) {
      fetchMockEvents(location.lat, location.lon, 15).then(setEvents);
    }
  }, [location]);

  const handleSearch = async () => {
    if (!searchInput) return;
    const newLocation = await fetchCoordinates(searchInput);
    if (newLocation) setLocation(newLocation);
  };

  return (
    <div className="map-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Ort suchen..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={handleSearch}>
          <Search size={20} />
        </button>
      </div>
      {location && (
        <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: "100vh", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[location.lat, location.lon]}>
            <Popup>Dein aktueller Standort</Popup>
          </Marker>
          {events.map((event) => (
            <Marker key={event._id} position={[event.latitude!, event.longitude!]}
              eventHandlers={{
                click: () => setSelectedEvent(event)
              }}>
              <Popup>{event.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      {selectedEvent && (
        <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default MapScreen;
