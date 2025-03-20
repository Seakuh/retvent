import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import { MapView } from "../MapView/MapView";
import { EventSection } from "./EventSection";
import { fetchFavoriteEvents } from "./service";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const EventPage = () => {
  const { location, favoriteEventIds } = useContext(UserContext);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [selectedNearbyEvent, setSelectedNearbyEvent] = useState<Event | null>(
    null
  );
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    52.520008, 13.404954,
  ]);

  const loadNearbyEvents = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `${API_URL}events/nearby?lat=${lat}&lon=${lon}&distance=${100}&limit=${100}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const events: Event[] = await response.json();
      setNearbyEvents(events);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyEvents(location.latitude, location.longitude);
    }
  }, [location, loadNearbyEvents]);

  const handleEventSelect = (event: Event) => {
    setSelectedNearbyEvent(event);
    const element = document.querySelector(`.card-${event.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      element.classList.add("hover-effect");
      setTimeout(() => {
        element.classList.remove("hover-effect");
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchFavorite = async () => {
      const favoriteEvents = await fetchFavoriteEvents(favoriteEventIds);
      setFavoriteEvents(favoriteEvents);
    };
    fetchFavorite();
  }, [location]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("latitude", latitude);
        console.log("longitude", longitude);
        setUserLocation([latitude, longitude]);
        if (map) {
          map.setView([latitude, longitude]);
        }
        loadNearbyEvents(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        const defaultLocation: [number, number] = [52.520008, 13.404954];
        setUserLocation(defaultLocation);
        loadNearbyEvents(defaultLocation[0], defaultLocation[1]);
      }
    );
  }, [map]);

  return (
    <div>
      <EventSection
        title="Nearby"
        events={nearbyEvents}
        selectedEvent={selectedNearbyEvent}
        onEventSelect={setSelectedNearbyEvent}
        className="nearby-section"
      />
      <MapView
        events={nearbyEvents}
        selectedEvent={selectedNearbyEvent}
        userLocation={[
          location?.latitude || 52.520008,
          location?.longitude || 13.404954,
        ]}
        onEventSelect={handleEventSelect}
      />
      <EventSection title="Favorites" events={favoriteEvents} />
    </div>
  );
};
