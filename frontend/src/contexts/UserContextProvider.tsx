import React, { useEffect, useState } from "react";
import { User, UserProvider } from "./UserContext";

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("favoriteEventIds");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoriteEventIds", JSON.stringify(favoriteEventIds));
  }, [favoriteEventIds]);

  const addFavorite = (eventId: string) => {
    setFavoriteEventIds((prev) => [...new Set([...prev, eventId])]);
  };

  const removeFavorite = (eventId: string) => {
    setFavoriteEventIds((prev) => prev.filter((id) => id !== eventId));
  };

  const isFavorite = (eventId: string): boolean => {
    return favoriteEventIds.includes(eventId);
  };

  return (
    <UserProvider
      value={{
        user,
        setUser,
        favoriteEventIds,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </UserProvider>
  );
};
