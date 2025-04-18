import React, { useEffect, useState } from "react";
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

  // TODO: remove this
  useEffect(() => {
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     setLocation({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //     });
    //   });
    // }
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteEventIds", JSON.stringify(favoriteEventIds));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loggedIn", JSON.stringify(loggedIn));
    console.log("loggedIn", loggedIn);
    if (!loggedIn) {
      localStorage.removeItem("user");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("access_token");
    }
  }, [favoriteEventIds, user, loggedIn]);

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
