const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const uploadEventImage = async (
  image: File
): Promise<{ _id: string }> => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    const formData = new FormData();
    formData.append("image", image);

    // MongoDB Location-Objekt korrekt definieren
    const location = {
      type: "Point",
      coordinates: [longitude, latitude], // longitude zuerst!
    };
    formData.append("location", JSON.stringify(location));

    // Token holen & API-Endpunkt setzen
    const endpoint = localStorage.getItem("access_token")
      ? `${API_URL}events/v4/upload/event-image`
      : `${API_URL}events/upload/event-image`;

    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Antwort:", errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data._id) {
      saveEventToLocalStorage(data._id);
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Hochladen:", error);
    throw error;
  }
};

// ✅ Hilfsfunktion für Geolocation mit Promise
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// ✅ Token sicher abrufen
const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token") || null;
};

const saveEventToLocalStorage = (_id: string) => {
  const existingEvents = JSON.parse(
    localStorage.getItem("uploadedEvents") || "[]"
  );

  if (!existingEvents.includes(_id)) {
    existingEvents.push(_id);
    localStorage.setItem("uploadedEvents", JSON.stringify(existingEvents));
  }
};
