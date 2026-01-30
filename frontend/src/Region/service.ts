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

export const uploadRegionLogo = async (
  regionId: string,
  logo: File
): Promise<IRegion | null> => {
  try {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("logo", logo);

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}regions/${regionId}/logo`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Bitte melde dich an, um Bilder hochzuladen");
      }
      throw new Error("Failed to upload logo");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading region logo:", error);
    throw error;
  }
};

export const uploadRegionImages = async (
  regionId: string,
  images: File[]
): Promise<IRegion | null> => {
  try {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}regions/${regionId}/images`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Bitte melde dich an, um Bilder hochzuladen");
      }
      throw new Error("Failed to upload images");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading region images:", error);
    throw error;
  }
};
