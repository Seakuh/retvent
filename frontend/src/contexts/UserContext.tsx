import { createContext, ReactNode, useState } from "react";

export interface User {
  id: string;
  email: string;
  profileImageUrl: string;
  headerImageUrl: string;
  groups: string[];
  username: string;
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
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  isFavorite: (eventId: string) => boolean;
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
  followedProfiles: User[];
  setFollowedProfiles: (followedProfiles: User[]) => void;
  setFavoriteEventIds: (favoriteEventIds: string[]) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  location: null,
  setUser: () => {},
  loggedIn: false,
  setLoggedIn: () => {},
  favoriteEventIds: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  userLocation: null,
  adjustUserLocation: () => {},
  setLocation: () => {},
  followedProfiles: [],
  setFollowedProfiles: () => {},
  setFavoriteEventIds: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);

  return (
    <UserContext.Provider value={{ location, setLocation }}>
      {children}
    </UserContext.Provider>
  );
};
