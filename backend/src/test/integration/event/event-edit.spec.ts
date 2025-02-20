import { TestContext, setupTestApp } from './test-setup';
import { clearTestDB } from '../../setup/test-setup';
import * as request from 'supertest';

jest.setTimeout(30000);

describe('Event Edit & Delete', () => {
  let ctx: TestContext;
  let testEventId: string;

  beforeAll(async () => {
    ctx = await setupTestApp();
  }, 30000);

  beforeEach(async () => {
    await clearTestDB();

    // Create a test event
    const event = await ctx.eventService.createEvent({
      title: 'Original Event',
      description: 'Original description',
      startDate: new Date('2024-03-20'),
      startTime: '16:00',
      category: 'music',
      hostId: ctx.testUserId,
      city: 'Berlin',
      price: '20€',
      ticketLink: 'https://tickets.com/original'
    });
    testEventId = event.id;
  });

  describe('PUT /events/:id', () => {
    it('should update all fields of own event', async () => {
      const updateData = {
        title: 'Updated Event',
        description: 'Updated description',
        startDate: '2024-03-21',
        startTime: '20:00',
        city: 'Hamburg',
        category: 'festival',
        price: '25€',
        ticketLink: 'https://tickets.com/updated',
        location: {
          address: 'New Address 123',
          coordinates: {
            lat: 53.5511,
            lng: 9.9937
          }
        }
      };

      const response = await request(ctx.app.getHttpServer())
        .put(`/events/${testEventId}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        ...updateData,
        hostId: ctx.testUserId,
        startDate: expect.any(String),
        id: testEventId
      });

      // Verify DB update
      const updated = await ctx.eventService.findById(testEventId);
      expect(updated?.title).toBe(updateData.title);
      expect(updated?.city).toBe(updateData.city);
    });

    it('should return 404 for non-existent event', async () => {
      await request(ctx.app.getHttpServer())
        .put('/events/nonexistentid')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send({ title: 'New Title' })
        .expect(404);
    });

    it('should return 403 when updating other user event', async () => {
      const otherEvent = await ctx.eventService.createEvent({
        title: 'Other User Event',
        startDate: new Date(),
        startTime: '19:00',
        hostId: 'other-user-id'
      });

      await request(ctx.app.getHttpServer())
        .put(`/events/${otherEvent.id}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send({ title: 'Try to update' })
        .expect(403);

      // Verify event was not updated
      const unchanged = await ctx.eventService.findById(otherEvent.id);
      expect(unchanged?.title).toBe('Other User Event');
    });

    it('should only update changed fields', async () => {
      const originalEvent = await ctx.eventService.findById(testEventId);
      
      const updateData = {
        title: 'Updated Title',
        // description stays the same
        startTime: '20:00'
      };

      const response = await request(ctx.app.getHttpServer())
        .put(`/events/${testEventId}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        ...originalEvent,
        ...updateData,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        startDate: expect.any(String),
        id: testEventId
      });

      // Verify only specified fields were updated
      const updated = await ctx.eventService.findById(testEventId);
      expect(updated?.title).toBe(updateData.title);
      expect(updated?.description).toBe(originalEvent?.description);
      expect(updated?.startTime).toBe(updateData.startTime);
      expect(new Date(updated?.updatedAt!).getTime()).toBeGreaterThan(new Date(originalEvent?.updatedAt!).getTime());
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete own event', async () => {
      const response = await request(ctx.app.getHttpServer())
        .delete(`/events/${testEventId}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Event deleted successfully'
      });

      // Verify event was deleted
      const deleted = await ctx.eventService.findById(testEventId);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent event', async () => {
      await request(ctx.app.getHttpServer())
        .delete('/events/nonexistentid')
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(404);
    });

    it('should return 403 when deleting other user event', async () => {
      const otherEvent = await ctx.eventService.createEvent({
        title: 'Other User Event',
        startDate: new Date(),
        startTime: '19:00',
        hostId: 'other-user-id'
      });

      await request(ctx.app.getHttpServer())
        .delete(`/events/${otherEvent.id}`)
        .set('Authorization', `Bearer ${ctx.authToken}`)
        .expect(403);

      // Verify event still exists
      const stillExists = await ctx.eventService.findById(otherEvent.id);
      expect(stillExists).toBeDefined();
      expect(stillExists?.title).toBe('Other User Event');
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
}); 