import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // Korrekte Importweise
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  dotenv.config(); // Funktion direkt aufrufen
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // allow these hosts to communicate with the backend
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      "https://event-scanner.com/",
      '*',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Statische Dateien servieren
  app.use('/images', express.static(path.join(__dirname, '..', 'uploads/images')));

  await app.listen(3145);
}
bootstrap();
