import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeolocationService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinates(address: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: address,
            format: 'json',
            limit: 1,
          },
        })
      );

      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  async getAddress(lat: number, lon: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            lat,
            lon,
            format: 'json',
          },
        })
      );

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }
}
