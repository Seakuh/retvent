import { TestContext, setupTestApp } from './test-setup';
import { clearTestDB } from '../../setup/test-setup';
import * as request from 'supertest';

jest.setTimeout(30000);

describe('Event Creation', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  }, 30000);

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /events/create', () => {
    it.only('should create event with city', async () => {
      const eventData = {
        title: 'Berlin Summer Festival',
        description: 'The biggest summer festival in Berlin',
        startDate: '2024-07-20',
        startTime: '18:00',
        city: 'Berlin',
      };

      const response = await request(ctx.app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send(eventData)
        .expect(201);

      console.log('Response body:', response.body);

      // Check city in response
      expect(response.body).toHaveProperty('city', 'Berlin');
      expect(response.body).toHaveProperty('location');
      expect(response.body.location).toHaveProperty('city', 'Berlin');

      // Other checks
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.description).toBe(eventData.description);
      expect(response.body.hostId).toBe(ctx.testUserId);

      // Verify DB
      const savedEvent = await ctx.eventService.findById(response.body.id);
      expect(savedEvent).toHaveProperty('city', 'Berlin');
      expect(savedEvent).toHaveProperty('location.city', 'Berlin');
    });

    it('should create event with all location details', async () => {
      const eventData = {
        title: 'Hamburg Harbor Festival',
        description: 'Festival at the harbor',
        startDate: '2024-08-15',
        startTime: '16:00',
        city: 'Hamburg',
        location: {
          address: 'Hafenstraße 1',
          coordinates: {
            lat: 53.5511,
            lng: 9.9937,
          },
        },
      };

      const response = await request(ctx.app.getHttpServer())
        .post('/events/create')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: eventData.title,
        description: eventData.description,
        hostId: ctx.testUserId,
        city: 'Hamburg',
        location: {
          city: 'Hamburg',
          address: 'Hafenstraße 1',
          coordinates: {
            lat: 53.5511,
            lng: 9.9937,
          },
        },
      });

      // Test searching by city
      const searchResponse = await request(ctx.app.getHttpServer())
        .get('/events/search')
        .query({ city: 'Hamburg' })
        .expect(200);

      expect(searchResponse.body).toHaveLength(1);
      expect(searchResponse.body[0].city).toBe('Hamburg');
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
});
