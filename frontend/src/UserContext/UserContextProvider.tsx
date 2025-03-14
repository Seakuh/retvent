import { ReactNode, useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { User, Event } from '../utils';
import { ViewMode } from '../types/event';

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [barearToken, setBarearToken] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('viewMode');
    return (savedMode as ViewMode) || 'list';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      view,
      setView,
      selectedEvent,
      setSelectedEvent,
      events,
      setEvents,
      barearToken,
      setBarearToken,
      viewMode,
      setViewMode,
    }}>
      {children}
    </UserContext.Provider>
  );
};