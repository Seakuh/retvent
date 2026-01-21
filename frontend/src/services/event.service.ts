import { Event } from "../utils";

export class EventService {
  private baseUrl =
    (import.meta.env.VITE_API_URL || "http://localhost:4000/") + "events";
  private token = localStorage.getItem("access_token");

  private getHeaders(isFormData: boolean = false) {
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${this.token}`,
    };
  }

  async updateEventImage(eventId: string, file: File): Promise<Event> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("eventId", eventId);
      const response = await fetch(`${this.baseUrl}/${eventId}/image`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update event image");
      }

      return await response.json();
    } catch (error) {
      console.error("Update event image error:", error);
      throw error;
    }
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

  async updateEvent(eventId: string, event: Partial<Event>): Promise<Event> {
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

  async updateEventPrompt(eventId: string, prompt: string): Promise<Event> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${this.baseUrl}/${eventId}/v2/prompt`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update event prompt");
      }

      return await response.json();
    } catch (error) {
      console.error("Update event prompt error:", error);
      throw error;
    }
  }

  async uploadDocument(eventId: string, file: File): Promise<string> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("eventId", eventId);

      const response = await fetch(`${this.baseUrl}/${eventId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload document");
      }

      const data = await response.json();
      return data.url || data.documentUrl;
    } catch (error) {
      console.error("Upload document error:", error);
      throw error;
    }
  }

  async deleteDocument(eventId: string, documentUrl: string): Promise<void> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `${this.baseUrl}/${eventId}/documents`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ documentUrl }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("Delete document error:", error);
      throw error;
    }
  }

  async updateEventMagicBio(eventId: string, bio: string): Promise<string> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${this.baseUrl}/${eventId}/magic-bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate magic bio");
      }

      const data = await response.json();
      return data.bio || data.description || "";
    } catch (error) {
      console.error("Update event magic bio error:", error);
      throw error;
    }
  }

  async uploadLineupPicture(eventId: string, file: File): Promise<string> {
    const accessToken = localStorage.getItem("access_token");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("eventId", eventId);

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/";
      const response = await fetch(`${baseUrl}events/lineup/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload lineup picture");
      }

      const data = await response.json();
      return data.url || data.imageUrl || "";
    } catch (error) {
      console.error("Upload lineup picture error:", error);
      throw error;
    }
  }
}
