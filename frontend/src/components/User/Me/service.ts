import { API_URL } from "../../../utils";

export const meService = {
  getMe: async (id: string) => {
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}profile/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json();
  },
};
