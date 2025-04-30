import { Heart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event, EventPageParams, FeedResponse } from "../../utils";
import { EventGalleryII } from "../EventGallery/EventGalleryII";
import { ExploreFeed } from "../Feed/ExploreFeed";
import { getLatestFeedByFollowing } from "../Feed/service";
import "./EventPage.css";
import { fetchFavoriteEvents } from "./service";

export const EventPage = ({
  startDate,
  endDate,
  category,
  location,
  prompt,
}: EventPageParams) => {
  const { favoriteEventIds } = useContext(UserContext);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [followedProfiles, setFollowedProfiles] = useState<FeedResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (favoriteEventIds.length > 0) {
          const [favoriteEvents, followedProfiles] = await Promise.all([
            fetchFavoriteEvents(favoriteEventIds, {
              startDate,
              endDate,
              category,
              location,
              prompt,
            }),
            getLatestFeedByFollowing(),
          ]);
          setFavoriteEvents(favoriteEvents);
          setFollowedProfiles(followedProfiles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [favoriteEventIds, startDate, endDate, category, location, prompt]);

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      ) : (
        <>
          <ExploreFeed feedItemsResponse={followedProfiles} />
          {favoriteEvents.length === 0 && (
            <div className="no-liked-events">
              <Heart size={100} />
              No liked events for your search. <br></br>Explore and like some
              events :)
            </div>
          )}

          <div className="event-favorites-container">
            <EventGalleryII events={favoriteEvents} title="Liked Events" />
          </div>
        </>
      )}
    </div>
  );
};

// const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
// const [selectedNearbyEvent, setSelectedNearbyEvent] = useState<Event | null>(
//   null
// );

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
