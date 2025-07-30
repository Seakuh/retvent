import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { GeolocationService } from '../../infrastructure/services/geolocation.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeolocationService', () => {
  let service: GeolocationService;

  const mockNominatimResponse = {
    data: {
      address: {
        city: 'Berlin',
        country: 'Germany',
        postcode: '10178',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeolocationService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GeolocationService>(GeolocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReverseGeocoding', () => {
    it('should return city name successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockNominatimResponse);

      const result = await service.getReverseGeocoding(52.520008, 13.404954);

      expect(result).toBe('Berlin');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=52.520008&lon=13.404954',
        {
          headers: {
            'User-Agent': 'EventApp/1.0',
            'Accept-Language': 'en',
          },
        },
      );
    });

    it('should return "City not found" when no city data available', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          address: {},
        },
      });

      const result = await service.getReverseGeocoding(0, 0);
      expect(result).toBe('City not found');
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await service.getReverseGeocoding(52.520008, 13.404954);
      expect(result).toBe('City not found');
    });

    it('should try alternative city fields if city is not available', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          address: {
            town: 'Small Town',
            city: null,
          },
        },
      });

      const result = await service.getReverseGeocoding(52.520008, 13.404954);
      expect(result).toBe('Small Town');
    });
  });
});
