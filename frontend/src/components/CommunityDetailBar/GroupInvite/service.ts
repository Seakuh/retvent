import { API_URL } from "../../../utils";

export const joinGroup = async (tokenId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/join/${tokenId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
