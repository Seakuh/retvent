import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // Korrekte Importweise
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  dotenv.config(); // Funktion direkt aufrufen
  const app = await NestFactory.create(AppModule);
  
  // CORS für lokale Entwicklung
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Statische Dateien servieren
  app.use('/images', express.static(path.join(__dirname, '..', 'uploads/images')));

  // start 3145
  const port = process.env.PORT || 3145;
  
  console.log(`Application is running on http://localhost:${port}`);
  // Wichtig: '0.0.0.0' damit der Container erreichbar ist
  await app.listen(port, '0.0.0.0');
}
bootstrap();
