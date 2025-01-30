const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


export const updateEvent = async (eventId: string, updatedEvent: any) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) throw new Error("Fehler beim Aktualisieren des Events");
      return await response.json();
    } catch (error) {
      console.error("Update Event Fehler:", error);
      return null;
    }
  };
  