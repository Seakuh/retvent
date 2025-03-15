// src/services/admin.service.tsx

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class AdminService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem("access_token");
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getHostEvents(hostId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}events/host/id/${hostId}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}events/${eventId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}events/${eventId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
