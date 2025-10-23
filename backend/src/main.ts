import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';

if (!(global as any).crypto?.randomUUID) {
  (global as any).crypto = Object.assign({}, (global as any).crypto, {
    randomUUID: () =>
      [4, 2, 2, 2, 6].map((len) => randomBytes(len).toString('hex')).join('-'),
  });
}

async function bootstrap() {
  // Load .env file before creating the app
  dotenv.config();

  // Debug: Log environment variables
  console.log('Environment variables loaded:', {
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    QDRANT_URL: process.env.QDRANT_URL,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY,
    QDRANT_EVENTS_COLLECTION: process.env.QDRANT_EVENTS_COLLECTION,
    QDRANT_USERS_COLLECTION: process.env.QDRANT_USERS_COLLECTION,
    EMBEDDING_DIM: process.env.EMBEDDING_DIM,
    HETZNER_ACCESS_KEY: process.env.HETZNER_ACCESS_KEY,
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  app.enableCors({
    origin: [
      'http://192.168.6.143:5173',
      'http://192.168.150.143:5173',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://www.retromountainphangan.com',
      'https://avanti-kollektiv.de',
      'https://www.event-scanner.com',
      'https://api.event-scanner.com',
      'https://api.avanti-kollektiv.com',
      'https://vartakt.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Statische Dateien servieren
  app.use(
    '/images',
    express.static(path.join(__dirname, '..', 'uploads/images')),
  );
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Debug: Zeige alle registrierten Routen
  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('\nRegistered Routes:');
  router.stack.forEach((route) => {
    if (route.route) {
      const methods = Object.keys(route.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${route.route.path}`);
    }
  });

  app.use((req, res, next) => {
    const originalSet = res.setHeader;
    res.setHeader = function (key, value) {
      if (key.toLowerCase() === 'access-control-allow-credentials') {
        console.log('🚨 Double Header?', value);
      }
      return originalSet.call(this, key, value);
    };
    next();
  });

  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`\nApplication is running on: http://localhost:${port}`);
}
bootstrap();
