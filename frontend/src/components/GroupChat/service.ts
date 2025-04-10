import { API_URL } from "../../utils";

export const getGroups = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/my-groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};
