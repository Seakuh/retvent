import React, { useEffect, useState } from "react";
import { User, UserProvider } from "./UserContext";

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("favoriteEventIds");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoriteEventIds", JSON.stringify(favoriteEventIds));
    localStorage.setItem("viewMode", viewMode);
  }, [favoriteEventIds, viewMode]);

  const addFavorite = (eventId: string) => {
    setFavoriteEventIds((prev) => [...new Set([...prev, eventId])]);
  };

  const removeFavorite = (eventId: string) => {
    setFavoriteEventIds((prev) => prev.filter((id) => id !== eventId));
  };

  const isFavorite = (eventId: string): boolean => {
    return favoriteEventIds.includes(eventId);
  };

  const adjustUserLocation = (
    userLocation: {
      latitude: number;
      longitude: number;
    } | null
  ) => {
    setUserLocation(userLocation);
  };

  const switchViewMode = (viewMode: "list" | "map") => {
    localStorage.setItem("viewMode", viewMode);
    setViewMode(viewMode);
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
        viewMode,
        switchViewMode,
        userLocation,
        adjustUserLocation,
      }}
    >
      {children}
    </UserProvider>
  );
};
