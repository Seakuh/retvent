import { CreateOrganiserDto } from '../../presentation/dtos/create-organiser.dto';

describe('CreateOrganiserDto', () => {
  let dto: CreateOrganiserDto;

  beforeEach(() => {
    dto = new CreateOrganiserDto();
  });

  it('should create an instance', () => {
    expect(dto).toBeDefined();
  });

  it('should accept valid organiser data', () => {
    const validData = {
      name: 'Test Organiser',
      description: 'Test Description',
      contactMail: 'test@example.com',
      location: '123456',
      genres: ['Rock', 'Pop'],
      socialMediaLinks: ['https://instagram.com/test'],
      instagramLink: 'https://instagram.com/test',
    };

    Object.assign(dto, validData);
    expect(dto.name).toBe(validData.name);
    expect(dto.description).toBe(validData.description);
    expect(dto.contactMail).toBe(validData.contactMail);
  });
});
