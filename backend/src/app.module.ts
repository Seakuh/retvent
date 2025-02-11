// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './presentation/controllers/event.controller';
import { EventService } from './application/services/event.service';
import { LocationController } from './presentation/controllers/location.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = 'mongodb+srv://gi:gi@cluster0.3qoob.mongodb.net/event?retryWrites=true&w=majority';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(MONGODB_URI),
    InfrastructureModule
  ],
  controllers: [EventController],
  providers: [EventService]
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized'); // Debug log
  }
}

// Log the connection URI (without credentials)
const sanitizedUri = MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@');
console.log('Trying to connect to MongoDB at:', sanitizedUri);