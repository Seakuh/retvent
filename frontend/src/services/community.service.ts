import { API_URL } from "../utils";

export interface Community {
  id: string;
  name: string;
  description?: string;
  codeOfConduct?: string;
  creatorId: string;
  isPublic?: boolean;
  imageUrl?: string;
  moderators: string[];
  members: string[];
  admins: string[];
  bannedUsers: string[];
  eventIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  username?: string;
  profileImageUrl?: string;
  type?: string;
  title?: string;
  description?: string;
  images?: string[];
  likes?: string[];
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMember {
  id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
}

export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const response = await fetch(`${API_URL}community/communities`);
    if (!response.ok) throw new Error("Failed to fetch communities");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

export const getCommunityById = async (
  communityId: string
): Promise<Community | null> => {
  try {
    const response = await fetch(`${API_URL}community/${communityId}`);
    if (!response.ok) throw new Error("Failed to fetch community");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching community:", error);
    return null;
  }
};

export const createCommunity = async (body: {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}): Promise<Community | null> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token");

    const response = await fetch(`${API_URL}community/create-community`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Failed to create community");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating community:", error);
    return null;
  }
};

export const joinCommunity = async (
  communityId: string
): Promise<boolean> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token");

    const response = await fetch(`${API_URL}community/join-community`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ communityId }),
    });

    if (!response.ok) throw new Error("Failed to join community");
    return true;
  } catch (error) {
    console.error("Error joining community:", error);
    return false;
  }
};

export const updateCommunity = async (
  communityId: string,
  body: {
    name?: string;
    description?: string;
    imageUrl?: string;
  }
): Promise<Community | null> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token");

    const response = await fetch(`${API_URL}community/update-community`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ communityId, ...body }),
    });

    if (!response.ok) throw new Error("Failed to update community");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating community:", error);
    return null;
  }
};

export const getCommunityMembers = async (
  communityId: string
): Promise<CommunityMember[]> => {
  try {
    const response = await fetch(
      `${API_URL}community/members/v2/${communityId}`
    );
    if (!response.ok) throw new Error("Failed to fetch members");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching community members:", error);
    return [];
  }
};

export const getCommunityPosts = async (
  communityId: string,
  offset: number = 0,
  limit: number = 20
): Promise<CommunityPost[]> => {
  try {
    const response = await fetch(
      `${API_URL}posts/${communityId}?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return [];
  }
};

export const createCommunityPost = async (
  communityId: string,
  title?: string,
  description?: string,
  images?: File[]
): Promise<CommunityPost | null> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token");

    const formData = new FormData();
    formData.append("communityId", communityId);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (images) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${API_URL}posts`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to create post");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating community post:", error);
    return null;
  }
};

export const uploadCommunityImage = async (
  file: File
): Promise<string | null> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token");

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}upload`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.url || data.imageUrl;
  } catch (error) {
    console.error("Error uploading community image:", error);
    return null;
  }
};
