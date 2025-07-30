import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImageService } from '../../infrastructure/services/image.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

describe('ImageService', () => {
  let service: ImageService;
  let configService: ConfigService;
  let mockS3Client: jest.Mocked<typeof S3Client>;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test image content'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                HETZNER_ACCESS_KEY: 'test-access-key',
                HETZNER_SECRET_KEY: 'test-secret-key',
                HETZNER_BUCKET_NAME: 'events-bucket',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    configService = module.get<ConfigService>(ConfigService);
    mockS3Client = S3Client as jest.Mocked<typeof S3Client>;
    jest
      .spyOn(mockS3Client.prototype, 'send')
      .mockImplementation(() => Promise.resolve({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test'; // Reset NODE_ENV after each test
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('HETZNER_BUCKET_NAME');
      expect(configService.get).toHaveBeenCalledWith('HETZNER_ACCESS_KEY');
      expect(configService.get).toHaveBeenCalledWith('HETZNER_SECRET_KEY');
    });
  });

  describe('uploadImage', () => {
    it('should return test URL in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const result = await service.uploadImage(mockFile);
      expect(result).toBe(
        'https://images.vartakt.com/images/groovecast_season_II/f1f068d6-4412-4d66-bc39-7c8cc661f575.png?width=2000&height=2000&quality=100',
      );
    });

    it('should upload image successfully to Hetzner', async () => {
      process.env.NODE_ENV = 'development';
      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const result = await service.uploadImage(mockFile);

      // Updated URL pattern to match new Hetzner endpoint
      expect(result).toMatch(
        /^https:\/\/events-bucket\.hel1\.your-objectstorage\.com\/events\/.+\.jpg$/,
      );
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'events-bucket',
            ContentType: 'image/jpeg',
            ACL: 'public-read',
          }),
        }),
      );
    });

    it('should handle files with different extensions', async () => {
      process.env.NODE_ENV = 'development';
      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const pngFile = {
        ...mockFile,
        originalname: 'test.png',
        mimetype: 'image/png',
      };
      const result = await service.uploadImage(pngFile);

      expect(result).toMatch(
        /^https:\/\/events-bucket\.hel1\.your-objectstorage\.com\/events\/.+\.png$/,
      );
    });

    it('should handle upload errors gracefully', async () => {
      process.env.NODE_ENV = 'development';
      const mockError = new Error('Network error');
      const mockSend = jest.fn().mockRejectedValue(mockError);
      mockS3Client.prototype.send = mockSend;

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        'Failed to upload image: Network error',
      );
    });

    it('should handle missing file extension', async () => {
      process.env.NODE_ENV = 'development';
      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const fileWithoutExt = { ...mockFile, originalname: 'testimage' };
      const result = await service.uploadImage(fileWithoutExt);

      expect(result).toMatch(
        /^https:\/\/events-bucket\.hel1\.your-objectstorage\.com\/events\/.+$/,
      );
    });

    it('should handle empty file buffer', async () => {
      process.env.NODE_ENV = 'development';
      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const emptyFile = { ...mockFile, buffer: Buffer.from('') };
      await expect(service.uploadImage(emptyFile)).resolves.toBeDefined();
      expect(mockSend).toHaveBeenCalled();
    });
  });
});
