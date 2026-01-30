// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ArtistController } from './presentation/controllers/artist.controller';
import { AssessmentController } from './presentation/controllers/assessment.controller';
import { CommentController } from './presentation/controllers/comment.controller';
import { CommunityController } from './presentation/controllers/comminuty.controller';
import { EventController } from './presentation/controllers/event.controller';
import { FeedController } from './presentation/controllers/feed.controller';
import { GroovecastController } from './presentation/controllers/groovecast.controller';
import { GroupController } from './presentation/controllers/group.controller';
import { MessageController } from './presentation/controllers/message.controller';
import { PostsController } from './presentation/controllers/posts.controller';
import { ProfileController } from './presentation/controllers/profile.controller';
import { RegistrationController } from './presentation/controllers/registration.controller';
import { SearchController } from './presentation/controllers/search.controller';
import { TicketsController } from './presentation/controllers/tickets.controller';
import { UserController } from './presentation/controllers/user.controller';
import { VoiceChatController } from './presentation/controllers/voice-chat.controller';
import { MailController } from './presentation/controllers/mail.controller';
import { RegionController } from './presentation/controllers/region.controller';
const MONGODB_URI = 'mongodb://localhost:27017';
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
    TicketsController,
    SearchController,
    MessageController,
    AssessmentController,
    GroupController,
    FeedController,
    ArtistController,
    CommunityController,
    PostsController,
    RegistrationController,
    VoiceChatController,
    MailController,
    RegionController,
  ],
})
export class AppModule {}

// Log the connection URI (without credentials)
const sanitizedUri = MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@');
console.log('Trying to connect to MongoDB at:', sanitizedUri);
