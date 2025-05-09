import React, { useEffect, useState } from "react";
import { eventService } from "../services/api";
import { Location, User, UserContext } from "./UserContext";
export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null
  );
  const [loggedIn, setLoggedIn] = useState<boolean>(
    localStorage.getItem("loggedIn")
      ? JSON.parse(localStorage.getItem("loggedIn") || "false")
      : false
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("favoriteEventIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!loggedIn) {
      localStorage.removeItem("user");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("favoriteEventIds");
      localStorage.removeItem("following");
      localStorage.removeItem("access_token");
    }
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
  }, [favoriteEventIds, user, loggedIn]);

  const addFavorite = async (eventId: string) => {
    void eventService.addFavorite(eventId);
    setFavoriteEventIds((prev) => [...new Set([...prev, eventId])]);
  };

  const removeFavorite = async (eventId: string) => {
    void eventService.removeFavorite(eventId);
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

  return (
    <UserContext.Provider
      value={{
        location,
        setLocation,
        loggedIn,
        setLoggedIn,
        user,
        setUser,
        favoriteEventIds,
        addFavorite,
        removeFavorite,
        isFavorite,
        userLocation,
        adjustUserLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
