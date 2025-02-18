import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/test-setup';
import { EventService } from '../../application/services/event.service';
import { AuthService } from '../../infrastructure/services/auth.service';

jest.setTimeout(30000);

describe('EventController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let eventService: EventService;
  let authService: AuthService;

  beforeAll(async () => {
    await setupTestDB();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventService = moduleFixture.get<EventService>(EventService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Generate unique email for each test
    const timestamp = new Date().getTime();
    const testEmail = `test${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;
    
    // Create test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        username: testUsername
      })
      .expect(201);

    testUserId = registerResponse.body.id;

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'password123'
      })
      .expect(201);

    authToken = loginResponse.body.access_token;
    console.log('Test auth token payload:', JSON.parse(atob(authToken.split('.')[1]))); // Debug JWT payload

    // Create test events
    await eventService.createEvent({
      title: 'Test Event 1',
      startDate: new Date(),
      startTime: '19:00',
      hostId: testUserId
    });

    await eventService.createEvent({
      title: 'Test Event 2',
      startDate: new Date(),
      startTime: '20:00',
      hostId: testUserId
    });
  });

  describe('POST /events/create', () => {
    it('should create minimal event', async () => {
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Minimal Test Event',
          startDate: '2024-03-20',
          startTime: '20:00'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.hostId).toBe(testUserId);
    });

    it('should create event with basic options', async () => {
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Jazz Night',
          description: 'Eine entspannte Jazznacht',
          startDate: '2024-03-25',
          startTime: '19:30',
          locationId: 'location123',
          category: 'music',
          price: "15.99",
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.price).toBe("15.99");
      expect(response.body.category).toBe('music');
      expect(response.body.hostId).toBe(testUserId);
    });

    it('should create full event with image', async () => {
      const testImage = Buffer.from('fake image data');
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImage, 'test.jpg')
        .field('title', 'Summer Festival 2024')
        .field('description', 'Das größte Festival des Jahres')
        .field('startDate', '2024-07-01')
        .field('startTime', '16:00')
        .field('locationId', 'location123')
        .field('category', 'festival')
        .field('price', '49.99')
        .field('hostId', testUserId)
        .field('ticketLink', 'https://tickets.example.com/summer-fest')
        .field('lineup', JSON.stringify([
          { name: 'DJ Cool', role: 'Headliner', startTime: '22:00' },
          { name: 'Band XYZ', role: 'Support', startTime: '20:00' }
        ]))
        .field('socialMediaLinks', JSON.stringify({
          instagram: 'https://instagram.com/summerfest',
          facebook: 'https://facebook.com/summerfest'
        }))
        .field('tags', JSON.stringify(['musik', 'sommer', 'festival']))
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.hostId).toBe(testUserId);
    });

    it('should create event with image and ticket link', async () => {
      const testImage = Buffer.from('fake image data');
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImage, 'test.jpg')
        .field('title', 'Concert with Tickets')
        .field('startDate', '2024-04-15')
        .field('startTime', '21:00')
        .field('hostId', testUserId)
        .field('ticketLink', 'https://tickets.example.com/concert')
        .field('price', '29.99')
        .field('category', 'concert')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.ticketLink).toBe('https://tickets.example.com/concert');
      expect(response.body.hostId).toBe(testUserId);
      expect(new Date(response.body.startDate)).toBeInstanceOf(Date);
      expect(response.body.title).toBe('Concert with Tickets');
      expect(response.body.price).toBe(29.99);
      expect(response.body.category).toBe('concert');
    });

    it('should reject invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Invalid Event')
        .field('startDate', '20-03-2024')
        .field('startTime', '20:00')
        .expect(400);

      expect(response.body.message).toContain('startDate must be in format YYYY-MM-DD');
    });
  });

  describe('GET /events/host/:hostId', () => {
    let createdEventId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Host Test Event')
        .field('startDate', '2024-03-20')
        .field('startTime', '20:00')
        .expect(201);

      createdEventId = response.body.id;
    });

    it('should get all events from host', async () => {
      await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Another Host Event')
        .field('startDate', '2024-03-21')
        .field('startTime', '21:00')
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/events/host/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].hostId).toBe(testUserId);
      expect(response.body[1].hostId).toBe(testUserId);
    });

    it('should return empty array for non-existent host', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/host/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  afterAll(async () => {
    await closeTestDB();
    await app.close();
  });
}); 