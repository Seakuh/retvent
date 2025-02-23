import { Event, ViewMode } from './types/event';

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


  export const fetchLatestEvents = async (): Promise<Event[]> => {
    try {
      const response = await fetch(`${API_URL}events/latest`);
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data.events || []; // Stelle sicher, dass wir das richtige Feld zurückgeben
    } catch (error) {
      console.error('Error in fetchLatestEvents:', error);
      return [];
    }
  };
  


  export const fetchUserEvents = async (): Promise<Event[]> => {
    const storedIds = JSON.parse(localStorage.getItem("uploadedEvents") || "[]");
  
    if (storedIds.length === 0) {
      return [];
    }
  
    try {
      const response = await fetch(`${API_URL}/events/byIds?ids=${storedIds.join(',')}`);
      if (!response.ok) throw new Error("Fehler beim Abrufen der Events");
  
      return await response.json();
    } catch (error) {
      console.error("Fehler beim Abrufen der hochgeladenen Events:", error);
      return [];
    }
  };
  