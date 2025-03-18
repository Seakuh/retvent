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
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);

  return (
    <UserContext.Provider value={{ location, setLocation }}>
      {children}
    </UserContext.Provider>
  );
};
