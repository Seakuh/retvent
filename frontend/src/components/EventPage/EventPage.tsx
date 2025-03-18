import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { EventSection } from "./EventSection";
import { fetchFavoriteEvents, fetchPopularEvents } from "./service";

export const EventPage = () => {
  const { location, favoriteEventIds } = useContext(UserContext);
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  useEffect(() => {
    const fetchPopular = async () => {
      const popularEvents = await fetchPopularEvents(
        location!.latitude,
        location!.longitude
      );
      setPopularEvents(popularEvents);
    };
    const fetchFavorite = async () => {
      const favoriteEvents = await fetchFavoriteEvents(favoriteEventIds);
      setFavoriteEvents(favoriteEvents);
    };
    fetchPopular();
    fetchFavorite();
  }, [location]);

  return (
    <div>
      <EventSection title="Nearby" events={popularEvents} />
      <EventSection title="Favorites" events={favoriteEvents} />
    </div>
  );
};
