import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  favoriteEventIds: string[];
}

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  addFavorite: (eventId: string) => void;
  removeFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
});

export const UserProvider = UserContext.Provider;
