import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GeolocationService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinates(locationName: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      }

      return null; // Kein Ergebnis gefunden
    } catch (error) {
      console.error('Geolocation Error:', error);
      return null;
    }
  }
}
