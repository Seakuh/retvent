import { TestContext, setupTestApp } from './test-setup';
import { clearTestDB } from '../../setup/test-setup';
import * as request from 'supertest';

// Tests für Event Search
describe('Event Search', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create test events with different cities
    await ctx.eventService.createEvent({
      title: 'Berlin Jazz Night',
      startDate: new Date('2024-03-20'),
      startTime: '19:00',
      category: 'music',
      hostId: ctx.testUserId,
      hostUsername: ctx.testUsername,
      location: {
        city: 'Berlin',
        address: 'Jazzclub Berlin',
      },
    });

    await ctx.eventService.createEvent({
      title: 'Hamburg Rock Festival',
      startDate: new Date('2024-03-21'),
      startTime: '20:00',
      category: 'festival',
      hostId: ctx.testUserId,
      hostUsername: ctx.testUsername,
      location: {
        city: 'Hamburg',
        address: 'Reeperbahn',
      },
    });
  });

  describe('GET /events/search', () => {
    it('should search events by query', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/search')
        .query({ query: 'Jazz' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toContain('Jazz');
    });

    it('should search events by city', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/search')
        .query({ city: 'Berlin' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location.city).toBe('Berlin');
    });

    it('should search events by query and city', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/search')
        .query({
          query: 'Rock',
          city: 'Hamburg',
        })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toContain('Rock');
      expect(response.body[0].location.city).toBe('Hamburg');
    });
  });

  describe('GET /events/nearby', () => {
    it('should find nearby events', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/nearby')
        .query({
          lat: 52.520008, // Berlin coordinates
          lon: 13.404954,
          distance: 10, // 10km radius
        })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location.city).toBe('Berlin');
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
});
