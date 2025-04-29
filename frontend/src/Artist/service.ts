import { API_URL, Artist } from "../utils";

export const getArtist = async (artistName: string): Promise<Artist | null> => {
  try {
    const response = await fetch(
      `${API_URL}artists/name?name=${encodeURIComponent(artistName)}`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("No artist found:", error);
    return null;
  }
};
