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

export async function getLatestFeedAll() {
  const response = await fetch(`${API_URL}feed/latest/all`);
  console.log("##############RESPONSE", await response.json());
  const data = await response.json();
  return data;
}

export async function getLatestFeedByProfileId(profileId: string) {
  const response = await fetch(`${API_URL}feed/latest/${profileId}`);
  console.log("##############RESPONSE", await response.json());
  const data = await response.json();
  return data;
}
