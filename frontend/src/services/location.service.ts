export interface Location {
  id: string;
  name: string;
  address: string;
}

export class LocationService {
  private baseUrl = 'https://api.event-scanner.com';

  async getLocations(): Promise<Location[]> {
    try {
      const response = await fetch(`${this.baseUrl}/locations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations 😢');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch locations error:', error);
      throw error;
    }
  }
} 