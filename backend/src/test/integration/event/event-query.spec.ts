import { TestContext, setupTestApp } from './test-setup';
import { clearTestDB } from '../../setup/test-setup';
import * as request from 'supertest';

jest.setTimeout(30000); // 30 seconds global timeout

// Tests für Event Queries
describe('Event Queries', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  }, 30000); // 30 seconds timeout for setup

  beforeEach(async () => {
    await clearTestDB();

    // Create test events
    await ctx.eventService.createEvent({
      title: 'Test Event 1',
      startDate: new Date('2024-03-20'),
      startTime: '19:00',
      category: 'music',
      hostId: ctx.testUserId,
      hostUsername: ctx.testUsername
    });

    await ctx.eventService.createEvent({
      title: 'Test Event 2',
      startDate: new Date('2024-03-21'),
      startTime: '20:00',
      category: 'festival',
      hostId: ctx.testUserId,
      hostUsername: ctx.testUsername
    });
  });

  describe('GET /events', () => {
    it('should get all events', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });

    it('should get all events with pagination', async () => {
      // Create 15 more events for pagination
      for (let i = 0; i < 15; i++) {
        await ctx.eventService.createEvent({
          title: `Pagination Event ${i}`,
          startDate: new Date('2024-03-20'),
          startTime: '19:00',
          category: 'music',
          hostId: ctx.testUserId,
          hostUsername: ctx.testUsername
        });
      }

      const response = await request(ctx.app.getHttpServer())
        .get('/events')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(10);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(17); // 15 + 2 from beforeEach
      expect(response.body.meta.pages).toBe(2);
    });
  });

  describe('GET /events/host/:username', () => {
    it('should get all events from host', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get(`/events/host/${ctx.testUsername}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].hostUsername).toBe(ctx.testUsername);
    });

    it('should return empty array for non-existent host', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/host/nonexistentuser')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /events/category/:category', () => {
    it('should get events by category', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/category/music')
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].category).toBe('music');
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(1);
    });

    it('should get events by category with pagination', async () => {
      // Create 8 more music events
      for (let i = 0; i < 8; i++) {
        await ctx.eventService.createEvent({
          title: `Music Event ${i}`,
          startDate: new Date('2024-03-20'),
          startTime: '19:00',
          category: 'music',
          hostId: ctx.testUserId,
          hostUsername: ctx.testUsername
        });
      }

      const response = await request(ctx.app.getHttpServer())
        .get('/events/category/music')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.events.length).toBe(5);
      expect(response.body.meta.total).toBe(9); // 8 + 1 from beforeEach
      expect(response.body.meta.pages).toBe(2);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/category/nonexistent')
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(0);
      expect(response.body.meta.total).toBe(0);
    }, 10000); // 10 seconds timeout for this specific test
  });

  describe('GET /events/latest', () => {
    it('should get latest events', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/latest')
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(2);
      expect(new Date(response.body.events[0].createdAt).getTime())
        .toBeGreaterThan(new Date(response.body.events[1].createdAt).getTime());
    });

    it('should respect limit parameter', async () => {
      // Create 5 more events
      for (let i = 0; i < 5; i++) {
        await ctx.eventService.createEvent({
          title: `Latest Event ${i}`,
          startDate: new Date('2024-03-20'),
          startTime: '19:00',
          hostId: ctx.testUserId,
          hostUsername: ctx.testUsername
        });
      }

      const limit = 3;
      const response = await request(ctx.app.getHttpServer())
        .get('/events/latest')
        .query({ limit })
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(limit);
      // Check if sorted by createdAt desc
      const dates = response.body.events.map(e => new Date(e.createdAt));
      expect(dates).toEqual([...dates].sort((a, b) => b.getTime() - a.getTime()));
    });
  });

  describe('GET /events/host/id/:hostId', () => {
    it('should get all events from host by id', async () => {
      // Create test events
      await ctx.eventService.createEvent({
        title: 'Host Event 1',
        startDate: new Date('2024-03-20'),
        startTime: '19:00',
        category: 'music',
        hostId: ctx.testUserId,
        city: 'Berlin'
      });

      await ctx.eventService.createEvent({
        title: 'Host Event 2',
        startDate: new Date('2024-03-21'),
        startTime: '20:00',
        category: 'festival',
        hostId: ctx.testUserId,
        city: 'Hamburg'
      });

      const response = await request(ctx.app.getHttpServer())
        .get(`/events/host/id/${ctx.testUserId}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(2);
      expect(response.body.events[0].hostId).toBe(ctx.testUserId);
      expect(response.body.meta.total).toBe(2);
    });

    it('should return empty array for non-existent hostId', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/events/host/id/nonexistentid')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBe(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should paginate results', async () => {
      // Create 15 test events
      for (let i = 0; i < 15; i++) {
        await ctx.eventService.createEvent({
          title: `Host Event ${i}`,
          startDate: new Date('2024-03-20'),
          startTime: '19:00',
          hostId: ctx.testUserId,
          city: 'Berlin'
        });
      }

      const response = await request(ctx.app.getHttpServer())
        .get(`/events/host/id/${ctx.testUserId}`)
        .query({ page: 2, limit: 5 })
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body.events.length).toBe(5);
      expect(response.body.meta).toMatchObject({
        total: 15,
        page: 2,
        limit: 5,
        pages: 3
      });
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
}); 