import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface GeocodingResponse {
  city: string;
  formattedAddress: string;
  country?: string;
  state?: string;
  postalCode?: string;
}

@Injectable()
export class GeolocationService {
  private readonly apiKey: string;
  private readonly geocodingApiUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async getReverseGeocoding(lat: number, lon: number): Promise<string> {
    return 'test';
    // Construct the Nominatim API URL with JSON format
    // const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    // try {
    //   // Send GET request with required headers for Nominatim
    //   const response = await axios.get(url, {
    //     headers: {
    //       'User-Agent': 'EventApp/1.0', // Required by Nominatim
    //       'Accept-Language': 'en' // Prefer English results
    //     }
    //   });
      
    //   const data = response.data;
      
    //   if (data && data.address) {
    //     // Nominatim may return the city under different keys depending on the location
    //     const { city, town, village, hamlet, suburb } = data.address;
    //     return city || town || village || hamlet || suburb || 'City not found';
    //   }
      
    //   return 'City not found';
    // } catch (error) {
    //   console.error('Error during reverse geocoding:', error);
    //   return 'City not found'; // Return default value instead of throwing
    // }
  }

  private extractAddressComponent(
    components: any[],
    type: string,
  ): string | undefined {
    const component = components.find(comp => 
      comp.types.includes(type)
    );
    return component?.long_name;
  }

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
