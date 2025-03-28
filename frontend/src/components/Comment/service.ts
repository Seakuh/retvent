import { API_URL, Comment } from "../../utils";

// Hilfsfunktion für die Headers
const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchComments = async (eventId: string) => {
  try {
    const response = await fetch(`${API_URL}comments/${eventId}`, {
      headers: getHeaders(),
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const createCommentToEvent = async (comment: Comment) => {
  console.log("createCommentToEvent", comment);

  return await fetch(`${API_URL}comments/event/${comment.eventId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      text: comment.text,
      parentId: comment.parentId,
    }),
  });
};

export const updateComment = async (comment: Comment) => {
  const response = await fetch(`${API_URL}/comments/${comment.id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      text: comment.text,
      parentId: comment.parentId,
    }),
  });
  return response.json();
};

export const deleteComment = async (commentId: string) => {
  const response = await fetch(`${API_URL}comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.json();
};

export const getCommentsByEventId = async (eventId: string) => {
  try {
    const response = await fetch(`${API_URL}comments/event/${eventId}`, {
      headers: getHeaders(),
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const getCommentsByUserId = async (userId: string) => {
  const response = await fetch(`${API_URL}comments/user/${userId}`, {
    headers: getHeaders(),
  });
  return response.json();
};
