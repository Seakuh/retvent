import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // Korrekte Importweise
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config(); // Funktion direkt aufrufen
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // allow these hosts to communicate with the backend
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      '*',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3145);
}
bootstrap();
