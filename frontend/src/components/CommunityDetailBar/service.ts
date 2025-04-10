import { API_URL } from "../../utils";

export const createGroup = async (eventId: string) => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${API_URL}groups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "New Group", // Sie können dies dynamisch machen
        description: "Group created from invite modal",
        eventId: eventId,
        isPublic: true,
      }),
    });

    if (!response.ok) throw new Error("Failed to create group");
    const data = await response.json();
    return data;
  } catch (err) {
    // setError("Failed to create group");
    console.error(err);
  }
};
