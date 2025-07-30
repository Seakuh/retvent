import { Test, TestingModule } from '@nestjs/testing';
import { GroovecastService } from '../groovecast.service';
import { MongoGrooveCastRepository } from '../../repositories/mongodb/groovecast.repository';
import { ImageService } from '../image.service';
import { GrooveCast } from '../../../core/domain/GrooveCast';
import { CreateGrooveCastDto } from '../../../presentation/dtos/create-groove-cast.dto';

describe('GroovecastService Integration', () => {
  let service: GroovecastService;
  let repository: MongoGrooveCastRepository;
  let imageService: ImageService;

  const mockCreateDto: CreateGrooveCastDto = {
    soundcloudUrl: 'https://soundcloud.com/test',
    season: 1,
    image: {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File,
  };

  const mockGrooveCast: GrooveCast = {
    soundcloudUrl: 'https://soundcloud.com/test',
    season: 1,
    imageUrl: 'https://storage.com/test.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroovecastService,
        {
          provide: MongoGrooveCastRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockGrooveCast),
            findAll: jest.fn().mockResolvedValue([mockGrooveCast]),
            findBySeason: jest.fn().mockResolvedValue([mockGrooveCast]),
          },
        },
        {
          provide: ImageService,
          useValue: {
            uploadImage: jest
              .fn()
              .mockResolvedValue('https://storage.com/test.jpg'),
          },
        },
      ],
    }).compile();

    service = module.get<GroovecastService>(GroovecastService);
    repository = module.get<MongoGrooveCastRepository>(
      MongoGrooveCastRepository,
    );
    imageService = module.get<ImageService>(ImageService);
  });

  it('should create a groovecast with image upload', async () => {
    const result = await service.create(mockCreateDto, mockCreateDto.image);

    expect(imageService.uploadImage).toHaveBeenCalledWith(mockCreateDto.image);
    expect(repository.create).toHaveBeenCalledWith(mockGrooveCast);
    expect(result).toEqual(mockGrooveCast);
  });

  it('should find all groovecasts', async () => {
    const result = await service.findAll();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockGrooveCast]);
  });

  it('should find groovecasts by season', async () => {
    const season = '1';
    const result = await service.findBySeason(season);

    expect(repository.findBySeason).toHaveBeenCalledWith(season);
    expect(result).toEqual([mockGrooveCast]);
  });

  it('should handle errors during creation', async () => {
    jest.spyOn(imageService, 'uploadImage').mockRejectedValueOnce(new Error());

    await expect(
      service.create(mockCreateDto, mockCreateDto.image),
    ).rejects.toThrow('Failed to create groovecast');
  });
});
