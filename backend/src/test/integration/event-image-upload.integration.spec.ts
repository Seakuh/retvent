import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../../application/services/event.service';
import { MongoEventRepository } from '../../infrastructure/repositories/mongodb/event.repository';
import { ImageService } from '../../infrastructure/services/image.service';
import { GeolocationService } from '../../infrastructure/services/geolocation.service';
import { ChatGPTService } from '../../infrastructure/services/chatgpt.service';

describe('EventService - Image Upload', () => {
  let service: EventService;
  let imageService: ImageService;
  let geoService: GeolocationService;
  let chatGptService: ChatGPTService;
  let eventRepository: MongoEventRepository;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: ImageService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
          },
        },
        {
          provide: GeolocationService,
          useValue: {
            getReverseGeocoding: jest.fn().mockResolvedValue({
              city: 'Berlin',
              formattedAddress: 'Sample Street 123, Berlin'
            }),
          },
        },
        {
          provide: ChatGPTService,
          useValue: {
            extractEventFromFlyer: jest.fn().mockResolvedValue({
              title: 'Test Event',
              description: 'Test Description'
            }),
          },
        },
        {
          provide: MongoEventRepository,
          useValue: {
            create: jest.fn().mockImplementation((data) => Promise.resolve({ id: '123', ...data })),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    imageService = module.get<ImageService>(ImageService);
    geoService = module.get<GeolocationService>(GeolocationService);
    chatGptService = module.get<ChatGPTService>(ChatGPTService);
    eventRepository = module.get<MongoEventRepository>(MongoEventRepository);
  });

  it('should process image upload with coordinates successfully', async () => {
    const result = await service.processEventImageUpload(mockFile, 52.520008, 13.404954);

    expect(result).toBeDefined();
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.location.city).toBe('Berlin');
    expect(result.location.coordinates).toEqual({ lat: 52.520008, lng: 13.404954 });
  });

  it('should handle image upload without coordinates', async () => {
    const result = await service.processEventImageUpload(mockFile);

    expect(result).toBeDefined();
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.location).toBeUndefined();
  });

  it('should handle failed ChatGPT extraction gracefully', async () => {
    jest.spyOn(chatGptService, 'extractEventFromFlyer').mockRejectedValue(new Error('API Error'));

    const result = await service.processEventImageUpload(mockFile, 52.520008, 13.404954);

    expect(result).toBeDefined();
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.location.city).toBe('Berlin');
  });

  it('should handle failed geolocation lookup gracefully', async () => {
    jest.spyOn(geoService, 'getReverseGeocoding').mockRejectedValue(new Error('Geo API Error'));

    const result = await service.processEventImageUpload(mockFile, 52.520008, 13.404954);

    expect(result).toBeDefined();
    expect(result.location.coordinates).toEqual({ lat: 52.520008, lng: 13.404954 });
    expect(result.location.city).toBeUndefined();
  });
}); 