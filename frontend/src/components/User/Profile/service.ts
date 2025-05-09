import { API_URL } from "../../../utils";

export const getProfile = async (userId: string) => {
  try {
    if (userId === "public") {
      return null;
    }
    const response = await fetch(`${API_URL}profile/${userId}`);

    const data = await response.json();
    return data;
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

export const shareProfile = async (userId: string) => {
  if (!userId) return;
  try {
    const shareData = {
      url: `${window.location.origin}/profile/${userId}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        shareData.url
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  } catch (error) {
    console.error("Error sharing profile:", error);
  }
};

export const fetchProfileComments = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}comments/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile comments:", error);
    return [];
  }
};

export const createChat = async (chatRequestProfileId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/create-user-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId: chatRequestProfileId }),
  });
  return response.json();
};

export class CreateGroupDto {
  name?: string;
  eventId?: string;
  description?: string;
  creatorId?: string;
  isPublic?: boolean;
  imageUrl?: string;
  memberIds?: string[];
}

export const getFeedItems = async (profileId: string) => {
  try {
    const response = await fetch(`${API_URL}feed/profile-feed/${profileId}`);
    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return [];
  }
};

export const followUser = async (userId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_URL}users/me/followedProfiles/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

export const unfollowUser = async (userId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_URL}users/me/followedProfiles/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
