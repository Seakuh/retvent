import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // Korrekte Importweise
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  dotenv.config(); // Funktion direkt aufrufen
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Ausführliches Logging
  });
  
  // CORS für alle Origins erlauben
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://www.retromountainphangan.com',
      'https://avanti-kollektiv.de'
    ],
    credentials: true
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Statische Dateien servieren
  app.use('/images', express.static(path.join(__dirname, '..', 'uploads/images')));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Debug: Zeige alle registrierten Routen
  const server = app.getHttpServer();
  const router = server._events.request._router;
  
  console.log('\nRegistered Routes:');
  router.stack.forEach(route => {
    if (route.route) {
      const methods = Object.keys(route.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${route.route.path}`);
    }
  });

  // start 3145
  const port = process.env.PORT || 3145;
  
  await app.listen(port, '0.0.0.0');
  console.log(`\nApplication is running on: http://localhost:${port}`);
}
bootstrap();
