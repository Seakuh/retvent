// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './presentation/controllers/event.controller';
import { LocationController } from './presentation/controllers/location.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';

dotenv.config(); // Lädt die .env-Datei

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI // Atlas in Produktion
        : 'mongodb://mongodb:27017/eventscanner', // Lokale DB in Entwicklung
      {
        retryAttempts: 5,
        autoIndex: true,
      }
    ),
    InfrastructureModule
  ],
  controllers: [EventController, LocationController]
})
export class AppModule {}