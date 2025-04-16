import { API_URL } from "../../utils";

export async function getProfiles() {
  const response = await fetch(`${API_URL}profile`);
  const data = await response.json();
  return data;
}

export async function getProfileFeed() {
  const response = await fetch(`${API_URL}/profile`);
  const data = await response.json();
  return data;
}
