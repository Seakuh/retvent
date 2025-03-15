import React, { useState } from "react";
import { User, UserProvider } from "./UserContext";

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const addFavorite = (eventId: string) => {
    if (!user) return;

    setUser({
      ...user,
      favoriteEventIds: [...new Set([...user.favoriteEventIds, eventId])],
    });
  };

  const removeFavorite = (eventId: string) => {
    if (!user) return;

    setUser({
      ...user,
      favoriteEventIds: user.favoriteEventIds.filter((id) => id !== eventId),
    });
  };

  const isFavorite = (eventId: string): boolean => {
    return user?.favoriteEventIds.includes(eventId) ?? false;
  };

  return (
    <UserProvider
      value={{
        user,
        setUser,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </UserProvider>
  );
};
