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
  try {
    const response = await fetch(`${API_URL}feed/latest/all`);
    const data = await response.json();
    if (response.status === 500) {
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching latest feed:", error);
    return [];
  }
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

export async function deleteFeed(feedId: string) {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}feed/${feedId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting feed:", error);
    return null;
  }
}
