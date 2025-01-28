export const uploadEventImage = async (image: File, lat?: number, lon?: number) => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat.toString());
      formData.append("lon", lon.toString());
    }

    const response = await fetch("http://localhost:3000/events/upload/event-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Fehler beim Upload");
    }

    const eventData = await response.json();
    return eventData; // Event-Daten aus dem Backend
  } catch (error) {
    console.error("Upload-Fehler:", error);
    return null;
  }
};
