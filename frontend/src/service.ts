import { Event } from "./types/event";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchLatestEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}events/latest?limit=40`);
    const data = await response.json();
    console.log("API Response:", data); // Debug log
    const events = data.events || [];
    return events.reverse(); // Reverse the array before returning
  } catch (error) {
    console.error("Error in fetchLatestEvents:", error);
    return [];
  }
};

export const fetchEventsByCategory = async (
  selectedCategory: string | null
): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}events/category/${selectedCategory}`
    );

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error fetching events by category:", error);
    return [];
  }
};

export const fetchUserEvents = async (): Promise<Event[]> => {
  const storedIds = JSON.parse(localStorage.getItem("uploadedEvents") || "[]");

  if (storedIds.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}/events/byIds?ids=${storedIds.join(",")}`
    );
    if (!response.ok) throw new Error("Fehler beim Abrufen der Events");

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der hochgeladenen Events:", error);
    return [];
  }
};

export const searchEventsByCity = async (city: string): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${API_URL}events/search/city?query=${encodeURIComponent(city)}`
    );
    const data = await response.json();
    console.log("City search response:", data);
    return data || [];
  } catch (error) {
    console.error("Error searching events by city:", error);
    return [];
  }
};
