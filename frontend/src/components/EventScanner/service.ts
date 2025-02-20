const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const uploadEventImage = async (image: File) => {
  return new Promise<{ _id: string }>((resolve, reject) => {
    // Nutzer-Position abrufen
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("User Location:", lat, lon);

        const formData = new FormData();
        formData.append("image", image);
        formData.append("uploadLat", lat.toString());
        formData.append("uploadLon", lon.toString());

        try {
          const response = await fetch(`${API_URL}/events/upload/event-image`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          console.log("Upload successful:", data);

          if (data._id) {
            saveEventToLocalStorage(data._id);
          }

          resolve(data);
        } catch (error) {
          console.error("Upload error:", error);
          reject(error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(error);
      }
    );
  });
};


const saveEventToLocalStorage = (_id: string) => {
  const existingEvents = JSON.parse(localStorage.getItem("uploadedEvents") || "[]");
  
  if (!existingEvents.includes(_id)) {
    existingEvents.push(_id);
    localStorage.setItem("uploadedEvents", JSON.stringify(existingEvents));
  }
};
