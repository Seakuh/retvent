// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CommentController } from './presentation/controllers/comment.controller';
import { EventController } from './presentation/controllers/event.controller';
import { GroovecastController } from './presentation/controllers/groovecast.controller';
import { GroupController } from './presentation/controllers/group.controller';
import { MessageController } from './presentation/controllers/message.controller';
import { ProfileController } from './presentation/controllers/profile.controller';
import { SearchController } from './presentation/controllers/search.controller';
import { UserController } from './presentation/controllers/user.controller';
const MONGODB_URI = 'mongodb://localhost:27017';
(global as any).crypto = crypto;
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    InfrastructureModule,
  ],
  controllers: [
    EventController,
    GroovecastController,
    CommentController,
    UserController,
    ProfileController,
    SearchController,
    MessageController,
    GroupController,
  ],
})
export class AppModule {}

// Log the connection URI (without credentials)
const sanitizedUri = MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@');
console.log('Trying to connect to MongoDB at:', sanitizedUri);
