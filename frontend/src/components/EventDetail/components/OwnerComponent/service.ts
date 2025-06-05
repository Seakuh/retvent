import { API_URL } from "../../../../utils";

export const addLineup = async (eventId: string, image: File) => {
  const accessToken = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("image", image);
  formData.append("eventId", eventId);
  const response = await fetch(`${API_URL}events/lineup/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const addGifs = async (eventId: string, image: File) => {
  const accessToken = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}events/gifs/upload`, {
    method: "POST",
    body: JSON.stringify({ eventId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const addTeaser = async (eventId: string, image: File) => {
  const accessToken = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("image", image);
  formData.append("eventId", eventId);
  const response = await fetch(`${API_URL}events/teaser/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const addUpdate = async (eventId: string, image: File) => {
  const accessToken = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("image", image);
  const response = await fetch(`${API_URL}events/update/upload`, {
    method: "POST",
    body: JSON.stringify({ eventId, image }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const createSponsored = async (eventId: string, sponsored: boolean) => {
  const accessToken = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}events/${eventId}/create-sponsored`, {
    method: "POST",
    body: JSON.stringify({ sponsored }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
