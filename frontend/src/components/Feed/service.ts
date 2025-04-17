import { API_URL, FeedResponse } from "../../utils";

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

export async function getLatestFeedAll(): Promise<FeedResponse[]> {
  const response = await fetch(`${API_URL}feed/latest/all`);
  const data = await response.json();
  return data;
}

export async function getLatestFeedByFollowing(): Promise<FeedResponse[]> {
  const following = JSON.parse(localStorage.getItem("following") || "[]");
  const response = await fetch(
    `${API_URL}feed/byIds?ids=${following.join(",")}`
  );
  const data = await response.json();
  return data;
}

export async function getLatestFeedByProfileId(profileId: string) {
  const response = await fetch(`${API_URL}feed/latest/${profileId}`);
  const data = await response.json();
  return data;
}
