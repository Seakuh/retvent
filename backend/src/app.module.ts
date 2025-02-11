// src/app.module.ts
import { Module, Controller, Get } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './presentation/controllers/event.controller';
import { LocationController } from './presentation/controllers/location.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller()
class TestController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('test-db')
  async testConnection() {
    try {
      // Test the connection
      const state = this.connection.readyState;
      console.log('MongoDB Connection State:', state);
      return {
        status: 'success',
        connectionState: state,
        message: state === 1 ? 'Connected to MongoDB' : 'Not connected'
      };
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

const MONGODB_URI = 'mongodb://gi:gi@cluster0.3qoob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(MONGODB_URI, {
      retryWrites: true,
      retryAttempts: 5,
      retryDelay: 1000,
    }),
    InfrastructureModule
  ],
  controllers: [EventController, LocationController, TestController]
})
export class AppModule {}

// Log the connection URI (without credentials)
const sanitizedUri = MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@');
console.log('Trying to connect to MongoDB at:', sanitizedUri);