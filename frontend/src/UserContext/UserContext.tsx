import { createContext } from 'react';
import { User } from '../utils';
import { Event } from '../utils';
import { ViewMode } from '../types/event';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  view: "map" | "list";
  setView: (view: "map" | "list") => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
  barearToken: string | null;
  setBarearToken: (token: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  view: 'list',
  setView: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  events: [],
  setEvents: () => {},
  barearToken: null,
  setBarearToken: () => {},
  viewMode: 'list',
  setViewMode: () => {},
} as UserContextType); 