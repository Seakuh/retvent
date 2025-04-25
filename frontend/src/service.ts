import { Event } from "./types/event";
import { Profile } from "./utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const searchProfiles = async (): Promise<Profile[]> => {
  const response = await fetch(`${API_URL}profile`);
  const data = await response.json();
  console.log("Profiles", data);
  return data || [];
};

export const searchEvents = async (
  location?: string,
  category?: string,
  prompt?: string,
  startDate?: string,
  endDate?: string
): Promise<Event[]> => {
  let url = `${API_URL}events/search/all`;

  const params = new URLSearchParams();

  if (location && location !== "Worldwide") {
    params.append("location", location);
  }
  if (category) {
    params.append("category", category);
  }
  if (prompt) {
    params.append("prompt", prompt);
  }
  if (startDate) {
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("endDate", endDate);
  }

  if (params.toString()) {
    url += "?" + params.toString();
  }
  const response = await fetch(url);
  const data = await response.json();
  return data.events || [];
};

export const fetchLatestEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}events/latest?limit=40`);
    const data = await response.json();
    const events = data.events || [];
    return events.reverse(); // Reverse the array before returning
  } catch (error) {
    console.error("Error in fetchLatestEvents:", error);
    return [];
  }
};

export const fetchLatestEventsByLocation = async (
  location: string
): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${API_URL}events/latest/city?city=${location}&limit=40`
    );
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error in fetchLatestEventsByLocation:", error);
    return [];
  }
};

export const fetchEventsByCategory = async (
  selectedCategory: string | null,
  selectedLocation: string | null
): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}events/category/${selectedCategory}${
        selectedLocation !== "Worldwide" ? `?location=${selectedLocation}` : ""
      }`
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

export const searchEventsByKeyword = async (
  keyword: string,
  selectedLocation: string | null
): Promise<Event[]> => {
  try {
    let url = `${API_URL}events/search/?query=${encodeURIComponent(keyword)}`;

    switch (selectedLocation) {
      case null:
        break;
      case "Worldwide":
        break;
      default:
        url += `&city=${selectedLocation}`;
        break;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error searching events by keyword:", error);
    return [];
  }
};

export const searchEventsByCategory = async (
  category: string
): Promise<Event[]> => {
  try {
    const response = await fetch(
      `${API_URL}events/search/category?query=${encodeURIComponent(category)}`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error searching events by category:", error);
    return [];
  }
};
