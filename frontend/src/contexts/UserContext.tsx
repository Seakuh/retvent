import { createContext, ReactNode, useState } from "react";

export interface User {
  id: string;
  email: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

interface UserContextType {
  user: User | null;
  location: Location | null;
  setUser: (user: User | null) => void;
  favoriteEventIds: string[];
  addFavorite: (eventId: string) => void;
  removeFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  viewMode: "list" | "map";
  switchViewMode: (viewMode: "list" | "map") => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  adjustUserLocation: (
    userLocation: {
      latitude: number;
      longitude: number;
    } | null
  ) => void;
  setLocation: (location: Location) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  location: null,
  setUser: () => {},
  favoriteEventIds: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  viewMode: "list",
  switchViewMode: () => {},
  userLocation: null,
  adjustUserLocation: () => {},
  setLocation: () => {},
  selectedDate: new Date(),
  setSelectedDate: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  return (
    <UserContext.Provider
      value={{
        location,
        setLocation,
        selectedDate,
        setSelectedDate,
        user,
        setUser,
        favoriteEventIds,
        addFavorite: (eventId: string) =>
          setFavoriteEventIds([...favoriteEventIds, eventId]),
        removeFavorite: (eventId: string) =>
          setFavoriteEventIds(favoriteEventIds.filter((id) => id !== eventId)),
        isFavorite: (eventId: string) => favoriteEventIds.includes(eventId),
        viewMode,
        switchViewMode: () => setViewMode(viewMode === "list" ? "map" : "list"),
        userLocation,
        adjustUserLocation: setUserLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
