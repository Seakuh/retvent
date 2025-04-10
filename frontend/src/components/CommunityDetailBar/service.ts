import { API_URL, Event } from "../../utils";

export const createGroup = async (event: Event) => {
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
        name: `We meet at ${event.title} at ${new Date().toLocaleString()}`,
        description: event.description,
        eventId: event.id,
        isPublic: true,
      }),
    });

    if (!response.ok) throw new Error("Failed to create group");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    // setError("Failed to create group");
    console.error(err);
  }
};
