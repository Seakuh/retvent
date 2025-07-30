import { Test, TestingModule } from '@nestjs/testing';
import { OrganiserService } from '../../infrastructure/services/organiser.service';
import { CreateOrganiserDto } from '../../presentation/dtos/create-organiser.dto';
import { MongoOrganiserRepository } from '../../infrastructure/repositories/mongodb/organiser.repository';

describe('OrganiserService', () => {
  let service: OrganiserService;
  let repository: MongoOrganiserRepository;

  const mockMongoOrganiserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganiserService,
        {
          provide: MongoOrganiserRepository,
          useValue: mockMongoOrganiserRepository,
        },
      ],
    }).compile();

    service = module.get<OrganiserService>(OrganiserService);
    repository = module.get<MongoOrganiserRepository>(MongoOrganiserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganiser', () => {
    it('should create an organiser successfully', async () => {
      const dto = new CreateOrganiserDto();
      dto.name = 'Test Organiser';
      dto.description = 'Test Description';

      const expectedResult = { id: '1', ...dto };
      mockMongoOrganiserRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockMongoOrganiserRepository.create).toHaveBeenCalledWith(dto);
    });
  });
});
