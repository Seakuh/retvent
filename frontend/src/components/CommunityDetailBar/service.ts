import { API_URL, Event } from "../../utils";

export const createGroup = async (event: Event) => {
  const token = localStorage.getItem("access_token");
  console.log(event);
  try {
    const response = await fetch(`${API_URL}groups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `${event.title} | ${new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`,
        description: event.description,
        eventId: event.id,
        isPublic: true,
        imageUrl: event.imageUrl,
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
