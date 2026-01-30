import { API_URL, IRegion } from "../utils";

export const getRegion = async (regionSlug: string): Promise<IRegion | null> => {
  try {
    const response = await fetch(
      `${API_URL}regions/slug/${encodeURIComponent(regionSlug)}`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("No region found:", error);
    return null;
  }
};

export const getRegionEvents = async (regionId: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_URL}regions/${regionId}/events`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.events || data || [];
  } catch (error) {
    console.error("Error fetching region events:", error);
    return [];
  }
};

export const searchRegions = async (query: string): Promise<IRegion[]> => {
  try {
    const response = await fetch(
      `${API_URL}regions/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.regions || data || [];
  } catch (error) {
    console.error("Error searching regions:", error);
    return [];
  }
};
