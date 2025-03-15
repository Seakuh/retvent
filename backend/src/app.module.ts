// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { EventController } from './presentation/controllers/event.controller';
import { GroovecastController } from './presentation/controllers/groovecast.controller';

const MONGODB_URI = 'mongodb://localhost:27017';

@Module({
  imports: [ConfigModule.forRoot(), InfrastructureModule],
  controllers: [EventController, GroovecastController],
})
export class AppModule {}

// Log the connection URI (without credentials)
const sanitizedUri = MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@');
console.log('Trying to connect to MongoDB at:', sanitizedUri);
