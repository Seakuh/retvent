import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { EventSection } from "./EventSection";
import {
  fetchAllEvents,
  fetchFavoriteEvents,
  fetchNearbyEvents,
  fetchNewEvents,
} from "./service";

export const EventPage = () => {
  const { location, favoriteEventIds } = useContext(UserContext);

  const { data: nearbyEvents = [] } = useQuery({
    queryKey: ["nearbyEvents"],
    queryFn: () =>
      fetchNearbyEvents(location!.latitude, location!.longitude, true),
  });

  const { data: newEvents = [] } = useQuery({
    queryKey: ["newEvents"],
    queryFn: fetchNewEvents,
  });

  const { data: favoriteEvents = [] } = useQuery({
    queryKey: ["favoriteEvents"],
    queryFn: () => fetchFavoriteEvents(favoriteEventIds),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ["allEvents"],
    queryFn: () => fetchAllEvents(),
  });

  console.log("allEvents", allEvents);
  console.log("favoriteEvents", favoriteEvents);
  console.log("newEvents", newEvents);
  console.log("nearbyEvents", nearbyEvents);

  return (
    <div>
      <EventSection title="Nearby" events={nearbyEvents} />
      {/* <EventSection title="Today" events={newEvents.events} /> */}
      {/* <EventSection title="New" events={newEvents.events} /> */}
      <EventSection title="Favorite" events={favoriteEvents} />
      {/* <EventSection title="All" events={allEvents} /> */}
    </div>
  );
};
