import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface EventLocationProps {
  lat: number;
  lon: number;
  title: string;
}

export const EventLocation: React.FC<EventLocationProps> = ({
  lat,
  lon,
  title,
}) => (
  <div className="event-location">
    <h3 className="section-headline">📍 Location</h3>
    <MapContainer center={[lat, lon]} zoom={13} className="event-map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[lat, lon]}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  </div>
);
