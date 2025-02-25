export class AdminService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async getHostEvents() {
    try {
      const response = await fetch('api/events/host', {
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const response = await fetch(`api/events/${eventId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete event');
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: any) {
    try {
      const response = await fetch(`api/events/${eventId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) throw new Error('Failed to update event');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
} 