import type { Profile, UserPreferences } from "../../../utils";
import { API_URL } from "../../../utils";

export const meService = {
  getMe: async (id: string) => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}users/me/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  updateProfile: async (id: string, profile: Partial<Profile>) => {
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
  updateProfileImage: async (id: string, file: File) => {
    const accessToken = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}profile/profile-picture/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },
  updateHeaderImage: async (id: string, file: File) => {
    const accessToken = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}profile/header-picture/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  },

  // @Get('preferences/:id')
  // @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
  // async setProfilePreferences(
  // @Param('id') id: string,
  // @Body() preferences: UserPreferences,
  updatePreferences: async (id: string, preferences: UserPreferences) => {
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}profile/preferences/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });
    return response.json();
  },

  getPreferences: async (id: string) => {
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}profile/preferences/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },
};
