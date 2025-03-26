import { API_URL } from "../../../utils";

export const getProfile = async (userId: string) => {
  try {
    if (userId === "public") {
      return null;
    }
    const response = await fetch(`${API_URL}users/${userId}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getUserEvents = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}events/host/id/${userId}`);
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error("Error fetching user events:", error);
    return [];
  }
};
