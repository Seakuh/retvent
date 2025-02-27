export interface CreateEventDto {
  title: string;
  startDate: string;
  startTime: string;
  // locationId: string;
  description: string;
  price?: string;
  eventLat?: number;
  eventLon?: number;
  ticketUrl?: string;
}

export class EventService {
  private baseUrl = import.meta.env.VITE_API_URL + 'events' || "http://localhost:4000" + 'events';
  private token = localStorage.getItem('access_token');

  private getHeaders(isFormData: boolean = false) {
    return {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Authorization': `Bearer ${this.token}`
    };
  }

  async createEvent(eventData: CreateEventDto, image?: File): Promise<any> {
    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }

      // Daten vorbereiten
      const preparedData = {
        ...eventData,
        startTime: eventData.startTime // HH:mm Format
      };

      // ISO 8601 Datumsformat für startDate
      if (eventData.startDate) {
        const date = new Date(eventData.startDate);
        eventData.startDate = date.toISOString().split('T')[0];
      }

      // Nur ausgefüllte Felder anhängen
      Object.entries(preparedData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event 😢');
      }

      return await response.json();
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  }
} 