import { API_URL, Comment } from "../../utils";

export const fetchComments = async (eventId: string) => {
  try {
    console.log("Fetching comments for event:", eventId);
    const response = await fetch(`${API_URL}comments/${eventId}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const createCommentToEvent = async (comment: Comment) => {
  const response = await fetch(`${API_URL}comments`, {
    method: "POST",
    body: JSON.stringify(comment),
  });
  return response.json();
};

export const updateComment = async (comment: Comment) => {
  const response = await fetch(`${API_URL}/comments/${comment.id}`, {
    method: "PUT",
    body: JSON.stringify(comment),
  });
  return response.json();
};

export const deleteComment = async (commentId: string) => {
  const response = await fetch(`${API_URL}comments/${commentId}`, {
    method: "DELETE",
  });
  return response.json();
};

export const getCommentsByEventId = async (eventId: string) => {
  try {
    console.log("Fetching comments for event:", eventId);
    const response = await fetch(`${API_URL}comments/event/${eventId}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const getCommentsByUserId = async (userId: string) => {
  const response = await fetch(`${API_URL}comments/user/${userId}`);
  return response.json();
};
