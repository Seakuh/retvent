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
    MongooseModule.forRoot('mongodb+srv://event-backend-deploy:mongodb123@cluster0.mongodb.net/Cluster0?retryWrites=true&w=majority'),
    InfrastructureModule
  ],
  controllers: [EventController, LocationController]
})
export class AppModule {}