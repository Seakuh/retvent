import { API_URL } from "../../../../utils";

export const addLineup = async (eventId: string) => {
  const response = await fetch(`${API_URL}/events/${eventId}/lineup`, {
    method: "POST",
  });
};

export const addGifs = async (eventId: string) => {
  const response = await fetch(`${API_URL}/events/${eventId}/gifs`, {
    method: "POST",
  });
};

export const addTeaser = async (eventId: string) => {
  const response = await fetch(`${API_URL}/events/${eventId}/teaser`, {
    method: "POST",
  });
};

export const addUpdate = async (eventId: string) => {
  const response = await fetch(`${API_URL}/events/${eventId}/update`, {
    method: "POST",
  });
};
