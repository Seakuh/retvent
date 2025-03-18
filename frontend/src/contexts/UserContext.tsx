import { createContext } from "react";

export interface User {
  id: string;
  email: string;
}

type UserContextType = {
  user: User | null;
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
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  favoriteEventIds: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  viewMode: "list",
  switchViewMode: () => {},
  userLocation: null,
  adjustUserLocation: () => {},
});

export const UserProvider = UserContext.Provider;
