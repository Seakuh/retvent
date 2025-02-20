import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { setupTestDB, clearTestDB } from '../../setup/test-setup';
import { EventService } from '../../../application/services/event.service';
import * as request from 'supertest';

export interface TestContext {
  app: INestApplication;
  eventService: EventService;
  authToken: string;
  testUsername: string;
  testUserId: string;
}

export async function setupTestApp(): Promise<TestContext> {
  await setupTestDB();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const eventService = moduleFixture.get<EventService>(EventService);

  // Create test user and get token
  const testUsername = `testuser${Date.now()}`;
  const testEmail = `test${Date.now()}@example.com`;

  const registerResponse = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: testEmail,
      username: testUsername,
      password: 'password123',
      isArtist: false
    });

  const testUserId = registerResponse.body.user.id;

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: testEmail,
      password: 'password123'
    });

  const authToken = loginResponse.body.access_token;

  return {
    app,
    eventService,
    authToken,
    testUsername,
    testUserId
  };
} 