import { Event } from "../utils";

export class EventService {
  private baseUrl =
    import.meta.env.VITE_API_URL + "events" ||
    "http://localhost:4000" + "events";
  private token = localStorage.getItem("access_token");

  private getHeaders(isFormData: boolean = false) {
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${this.token}`,
    };
  }

  async createEvent(eventData: Event, image?: File): Promise<Event> {
    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      }

      // Daten vorbereiten
      const preparedData = {
        ...eventData,
        startTime: eventData.startTime, // HH:mm Format
      };

      // ISO 8601 Datumsformat für startDate
      if (eventData.startDate) {
        const date = new Date(eventData.startDate);
        eventData.startDate = date.toISOString().split("T")[0];
      }

      // Nur ausgefüllte Felder anhängen
      Object.entries(preparedData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      console.log(this.getHeaders(true));

      const response = await fetch(`${this.baseUrl}/create`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event 😢");
      }

      return await response.json();
    } catch (error) {
      console.error("Create event error:", error);
      throw error;
    }
  }

  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await fetch(`${this.baseUrl}/byId?id=${eventId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      return await response.json();
    } catch (error) {
      console.error("Get event error:", error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: Event): Promise<Event> {
    console.log(event);
    try {
      const response = await fetch(`${this.baseUrl}/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update event");
      }

      return await response.json();
    } catch (error) {
      console.error("Update event error:", error);
      throw error;
    }
  }
}
