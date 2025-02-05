// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './presentation/controllers/event.controller';
import { LocationController } from './presentation/controllers/location.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';

dotenv.config(); // Lädt die .env-Datei

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/eventscanner'), // Nutzt die MongoDB-URL aus .env
    InfrastructureModule
  ],
  controllers: [EventController, LocationController]
})
export class AppModule {}