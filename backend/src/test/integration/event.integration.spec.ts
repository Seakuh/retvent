import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { setupTestDB, clearTestDB, closeTestDB } from '../setup/test-setup';
import { EventService } from '../../application/services/event.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

jest.setTimeout(30000);

describe('EventController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUsername: string;
  let eventService: EventService;
  let jwtService: JwtService;
  let testUserId: string;


  beforeAll(async () => {
    await setupTestDB();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    eventService = moduleFixture.get<EventService>(EventService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await clearTestDB();
    
    testUsername = `testuser${Date.now()}`;
    const testEmail = `test${Date.now()}@example.com`;
    
    // Register user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        username: testUsername,
        password: 'password123',
      });

    console.log('Register response:', registerResponse.body);  // Debug log
    testUserId = registerResponse.body.user.id;  // Make sure we get the ID from the correct place

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'password123'
      });

    console.log('Login response:', loginResponse.body);  // Debug log
    authToken = loginResponse.body.access_token;

    // Create test events with username
    await eventService.createEvent({
      title: 'Test Event 1',
      startDate: new Date(),
      startTime: '19:00',
      hostUsername: testUsername  // Use username instead of ID
    });

    await eventService.createEvent({
      title: 'Test Event 2',
      startDate: new Date(),
      startTime: '20:00',
      hostUsername: testUsername  // Use username instead of ID
    });
  });

  describe('POST /events/create', () => {
    it('should create minimal event', async () => {
      // First log the testUserId to debug
      console.log('testUserId:', testUserId);
      console.log('authToken:', authToken);

      const response = await request(app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Minimal Test Event',
          startDate: '2024-03-20',
          startTime: '20:00'
        })
        .expect(201);

      console.log('Response body:', response.body);

      // Check if we have an ID
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('Minimal Test Event');
      expect(response.body.hostId).toBe(testUserId);
      expect(new Date(response.body.startDate)).toBeInstanceOf(Date);
      expect(response.body.startTime).toBe('20:00');
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
        .field('hostUsername', testUsername)
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
      expect(response.body.price).toBe("49.99");
      expect(response.body.category).toBe('festival');
      expect(response.body.hostId).toBe(testUserId);
      expect(response.body.lineup).toBeDefined();
      expect(response.body.socialMediaLinks).toBeDefined();
      expect(response.body.tags).toBeDefined();
      expect(response.body.hostUsername).toBe(testUsername);
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
        .field('hostUsername', testUsername)
        .field('ticketLink', 'https://tickets.example.com/concert')
        .field('price', '29.99')
        .field('category', 'concert')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.ticketLink).toBe('https://tickets.example.com/concert');
      expect(response.body.hostUsername).toBe(testUsername);
      expect(new Date(response.body.startDate)).toBeInstanceOf(Date);
      expect(response.body.title).toBe('Concert with Tickets');
      expect(response.body.price).toBe("29.99");
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

      expect(response.body.message).toContain(["startDate must be a valid ISO 8601 date string"]);
    });
  });

  describe('GET /events/host/:username', () => {
    it('should get all events from host', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/host/${testUsername}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].hostUsername).toBe(testUsername);
      expect(response.body[1].hostUsername).toBe(testUsername);
    });

    it('should return empty array for non-existent host', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/host/nonexistentuser')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  // describe('POST /events/create/public', () => {
  //   it('should create public event without auth', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/events/create/public')
  //       .send({
  //         title: 'Public Test Event',
  //         startDate: '2024-03-20',
  //         startTime: '20:00',
  //         description: 'Event for everyone'
  //       })
  //       .expect(201);

  //     expect(response.body.hostUsername).toBe('public');
  //     expect(response.body.title).toBe('Public Test Event');
  //     expect(response.body.description).toBe('Event for everyone');
  //   });

  //   it('should create public event with image', async () => {
  //     const testImage = Buffer.from('fake image data');
  //     const response = await request(app.getHttpServer())
  //       .post('/events/create/public')
  //       .attach('image', testImage, 'test.jpg')
  //       .field('title', 'Public Event with Image')
  //       .field('startDate', '2024-03-20')
  //       .field('startTime', '20:00')
  //       .expect(201);

  //     expect(response.body).toHaveProperty('imageUrl');
  //     expect(response.body.hostUsername).toBe('public');
  //   });
  // });

  afterAll(async () => {
    await closeTestDB();
    await app.close();
  });
}); 