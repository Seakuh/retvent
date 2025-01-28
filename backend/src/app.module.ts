// src/app.module.ts
import { Module } from '@nestjs/common';
import { EventController } from './presentation/controllers/event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './core/domain/event.schema';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import * as dotenv from 'dotenv';


dotenv.config(); // Lädt die .env-Datei


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/eventscanner'), // Nutzt die MongoDB-URL aus .env
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    InfrastructureModule   
  ],
  controllers: [EventController],
})
export class AppModule {}