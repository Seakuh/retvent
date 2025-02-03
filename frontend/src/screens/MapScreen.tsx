import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { IoLocationOutline, IoSearchOutline } from 'react-icons/io5';
import debounce from 'lodash/debounce';
import "leaflet/dist/leaflet.css";
import { Event } from "../types/event";
import { CategoryFilter } from '../components/CategoryFilter';

const DEFAULT_CENTER = { lat: 9.7348, lng: 100.0208 }; // Koh Phangan
const DEFAULT_ZOOM = 12;

interface Location {
  name: string;
  lat: number;
  lng: number;
}

const LocationSearch = ({ onSelect }: { onSelect: (location: Location) => void }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);

  const searchLocations = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const data = await response.json();
      setSuggestions(data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })));
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  }, 300);

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchLocations(e.target.value);
          }}
          placeholder="Search location..."
          className="w-full px-4 py-2 pl-10 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg text-gray-800 placeholder-gray-500"
        />
        <IoSearchOutline className="absolute left-3 top-3 text-gray-500" />
      </div>
      
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 hover:bg-gray-100/90 transition-colors text-gray-800"
              onClick={() => {
                onSelect(suggestion);
                setQuery(suggestion.name);
                setSuggestions([]);
              }}
            >
              {suggestion.name}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const LocationButton = () => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleClick = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.flyTo(
          [position.coords.latitude, position.coords.longitude],
          15,
          {
            duration: 1.5
          }
        );
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isLocating ? { rotate: 360 } : {}}
      transition={isLocating ? { 
        rotate: { 
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }
      } : {}}
      onClick={handleClick}
      className="absolute bottom-20 left-4 z-[400] p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg 
                hover:bg-blue-50/90 transition-colors border border-blue-100/50"
      title="Find my location"
    >
      <IoLocationOutline 
        className={`text-base ${isLocating ? 'text-blue-600' : 'text-blue-500'}`}
      />
    </motion.button>
  );
};

const MapScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const endpoint = selectedCategory 
      ? `http://localhost:3145/events/category/${selectedCategory}`
      : 'http://localhost:3145/events/latest';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        console.info('Fetched events:', data.events);
        setEvents(data.events);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, [selectedCategory]);

  const handleLocationSelect = (location: Location) => {
    if (mapRef.current) {
      const map = mapRef.current as any;
      map.setView([location.lat, location.lng], 13);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full relative flex flex-col pb-16">
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="flex-1 relative">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationButton />
          {events.map((event) => (
            <Marker
              key={event.id}
              position={[event.location.coordinates.lat, event.location.coordinates.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <LocationSearch onSelect={handleLocationSelect} />
      </div>
    </div>
  );
};

export default MapScreen;
