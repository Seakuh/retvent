import type { Profile } from "../../../utils";
import { API_URL } from "../../../utils";

export const meService = {
  getMe: async (id: string) => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}profile/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
  updateProfile: async (id: string, profile: Profile) => {
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}profile/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    return response.json();
  },
};
