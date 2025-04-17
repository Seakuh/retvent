import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event, FeedResponse } from "../../utils";
import { ExploreFeed } from "../Feed/ExploreFeed";
import { getLatestFeedByFollowing } from "../Feed/service";
import { LikedEvents } from "../LikedEvents/LikedEvents";
import "./EventPage.css";
import { fetchFavoriteEvents } from "./service";

export const EventPage = () => {
  const { location, favoriteEventIds } = useContext(UserContext);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [selectedNearbyEvent, setSelectedNearbyEvent] = useState<Event | null>(
    null
  );
  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);

  useEffect(() => {
    const fetchFavorite = async () => {
      const favoriteEvents = await fetchFavoriteEvents(favoriteEventIds);
      setFavoriteEvents(favoriteEvents);
    };
    fetchFavorite();

    const fetchFollowedProfiles = async () => {
      const followedProfiles = await getLatestFeedByFollowing();
      setFollowedProfiles(followedProfiles);
    };
    fetchFollowedProfiles();
  }, []);

  return (
    <div>
      <ExploreFeed feedItemsResponse={followedProfiles} />
      {/* <HomeBubbles /> */}
      <div className="event-favorites-container">
        <LikedEvents />
      </div>
    </div>
  );
};

// const [map, setMap] = useState<any>(null);
// const [userLocation, setUserLocation] = useState<[number, number]>([
//   52.520008, 13.404954,
// ]);

// useEffect(() => {
//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;
//       setUserLocation([latitude, longitude]);
//       if (map) {
//         map.setView([latitude, longitude]);
//       }
//       loadNearbyEvents(latitude, longitude);
//     },
//     (error) => {
//       console.error("Geolocation error:", error);
//       const defaultLocation: [number, number] = [52.520008, 13.404954];
//       setUserLocation(defaultLocation);
//       loadNearbyEvents(defaultLocation[0], defaultLocation[1]);
//     }
//   );
// }, [map]);

/* <h1 className="section-title">Nearby</h1>
      <div className="nearby-section-container">
        <EventSection
          events={nearbyEvents}
          selectedEvent={selectedNearbyEvent}
          onEventSelect={setSelectedNearbyEvent}
          className="nearby-section"
        />
      </div> */

/* <div className="map-view-container">
        <MapView
          events={nearbyEvents}
          selectedEvent={selectedNearbyEvent}
          userLocation={[
            location?.latitude || 52.520008,
            location?.longitude || 13.404954,
          ]}
          onEventSelect={handleEventSelect}
        />
      </div> */

// const handleEventSelect = (event: Event) => {
//   setSelectedNearbyEvent(event);
//   const element = document.querySelector(`.card-${event.id}`);
//   if (element) {
//     element.scrollIntoView({ behavior: "smooth" });
//     element.classList.add("hover-effect");
//     setTimeout(() => {
//       element.classList.remove("hover-effect");
//     }, 2000);
//   }
// };

// const loadNearbyEvents = useCallback(async (lat: number, lon: number) => {
//   try {
//     const response = await fetch(
//       `${API_URL}events/nearby?lat=${lat}&lon=${lon}&distance=${100}&limit=${100}`
//     );
//     if (!response.ok) throw new Error("Failed to fetch events");
//     const events: Event[] = await response.json();
//     setNearbyEvents(events);
//   } catch (error) {
//     console.error("Error loading events:", error);
//   }
// }, []);

// useEffect(() => {
//   if (location) {
//     loadNearbyEvents(location.latitude, location.longitude);
//   }
// }, [location, loadNearbyEvents]);
