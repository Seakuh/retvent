import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AssessmentService } from 'src/application/services/assessment.service';
import { BotService } from 'src/application/services/bot.service';
import { CommentService } from 'src/application/services/comment.service';
import { CommunityService } from 'src/application/services/community.service';
import { EventEmbeddingService } from 'src/application/services/eventembedding.service';
import { FeedService } from 'src/application/services/feed.service';
import { GroupService } from 'src/application/services/group.service';
import { MailService } from 'src/application/services/mail.service';
import { MessageService } from 'src/application/services/message.service';
import { ProfileService } from 'src/application/services/profile.service';
import { TicketsService } from 'src/application/services/ticket.service';
import { MessageSchema } from 'src/core/domain/message.schema';
import { TicketSchema } from 'src/core/domain/ticket.schema';
import { ArtistController } from 'src/presentation/controllers/artist.controller';
import { CommentController } from 'src/presentation/controllers/comment.controller';
import { FeedController } from 'src/presentation/controllers/feed.controller';
import { GroovecastController } from 'src/presentation/controllers/groovecast.controller';
import { MessageController } from 'src/presentation/controllers/message.controller';
import { SearchController } from 'src/presentation/controllers/search.controller';
import { TicketsController } from 'src/presentation/controllers/tickets.controller';
import { UserController } from 'src/presentation/controllers/user.controller';
import { EventMapper } from '../application/mappers/event.mapper';
import { EventService } from '../application/services/event.service';
import { LocationService } from '../application/services/location.service';
import { UserService } from '../application/services/user.service';
import { CoreModule } from '../core/core.module';
import { BcryptService } from '../core/services/bcrypt.service';
import { AssessmentController } from '../presentation/controllers/assessment.controller';
import { AuthController } from '../presentation/controllers/auth.controller';
import { EventController } from '../presentation/controllers/event.controller';
import { GroupController } from '../presentation/controllers/group.controller';
import { LocationController } from '../presentation/controllers/location.controller';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { OwnerGuard } from '../presentation/guards/owner.guard';
import { AuthModule } from './modules/auth.module';
import { MongoCommentRepository } from './repositories/mongodb/comment.repository';
import { MongoEventRepository } from './repositories/mongodb/event.repository';
import { MongoFeedRepository } from './repositories/mongodb/feed.repository';
import { MongoGrooveCastRepository } from './repositories/mongodb/groovecast.repository';
import { MongoGroupRepository } from './repositories/mongodb/group.repository';
import { MongoLocationRepository } from './repositories/mongodb/location.repository';
import { MongoMessageRepository } from './repositories/mongodb/message.repository';
import { MongoProfileRepository } from './repositories/mongodb/profile.repository';
import { MongoTicketRepository } from './repositories/mongodb/ticket.repository';
import { MongoUserRepository } from './repositories/mongodb/user.repository';
import { CommentSchema } from './schemas/comment.schema';
import { EventSchema } from './schemas/event.schema';
import { FeedSchema } from './schemas/feed.schame';
import { GroovecastSchema } from './schemas/groovecast.schema';
import { GroupSchema } from './schemas/group.schmema';
import { LocationSchema } from './schemas/location.schema';
import { ProfileSchema } from './schemas/profile.schema';
import { UserSchema } from './schemas/user.schema';
import { AuthService } from './services/auth.service';
import { ChatGPTService } from './services/chatgpt.service';
import { GeolocationService } from './services/geolocation.service';
import { GroovecastService } from './services/groovecast.service';
import { ImageService } from './services/image.service';
import { QdrantService } from './services/qdrant.service';
import { VideoService } from './services/video.service';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    CoreModule,
    AuthModule,
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
          port: configService.get<number>('EMAIL_PORT', 587),
          secure: false, // true für Port 465
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>(
            'EMAIL_FROM',
            '"Event Scanner" <noreply@eventscanner.com>',
          ),
        },
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'User', schema: UserSchema },
      { name: 'GrooveCast', schema: GroovecastSchema },
      { name: 'Comment', schema: CommentSchema },
      { name: 'Profile', schema: ProfileSchema },
      { name: 'Feed', schema: FeedSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'Ticket', schema: TicketSchema },
    ]),
  ],
  controllers: [
    AuthController,
    LocationController,
    EventController,
    GroovecastController,
    CommentController,
    UserController,
    SearchController,
    GroupController,
    MessageController,
    FeedController,
    AssessmentController,
    ArtistController,
    TicketsController,
  ],
  providers: [
    EventService,
    ProfileService,
    CommentService,
    GroupService,
    MessageService,
    ChatGPTService,
    MailService,
    TicketsService,
    FeedService,
    EventEmbeddingService,
    ImageService,
    AssessmentService,
    VideoService,
    GeolocationService,
    LocationService,
    AuthService,
    MongoEventRepository,
    MongoGroupRepository,
    MongoLocationRepository,
    BotService,
    MongoUserRepository,
    MongoGrooveCastRepository,
    MongoCommentRepository,
    MongoProfileRepository,
    MongoMessageRepository,
    MongoFeedRepository,
    MongoTicketRepository,
    JwtStrategy,
    JwtAuthGuard,
    OwnerGuard,
    EventMapper,
    ConfigService,
    CommunityService,
    BcryptService,
    UserService,
    GroovecastService,
    QdrantService,
    {
      provide: 'IEventRepository',
      useClass: MongoEventRepository,
    },
    {
      provide: 'ILocationRepository',
      useClass: MongoLocationRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    {
      provide: 'ICommentRepository',
      useClass: MongoCommentRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: MongoProfileRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: MongoGroupRepository,
    },
    {
      provide: 'IMessageRepository',
      useClass: MongoMessageRepository,
    },
    {
      provide: 'IFeedRepository',
      useClass: MongoFeedRepository,
    },
    {
      provide: 'ITicketRepository',
      useClass: MongoTicketRepository,
    },
  ],
  exports: [
    EventService,
    EventEmbeddingService,
    ChatGPTService,
    FeedService,
    LocationService,
    AuthService,
    CommunityService,
    GroupService,
    ImageService,
    AssessmentService,
    VideoService,
    ChatGPTService,
    JwtAuthGuard,
    OwnerGuard,
    'IEventRepository',
    'ILocationRepository',
    'IUserRepository',
    'ICommentRepository',
    'IProfileRepository',
    'IGroupRepository',
    'IMessageRepository',
    'IFeedRepository',
    'ITicketRepository',
    JwtModule,
    MongoEventRepository,
    MongoProfileRepository,
    MongoLocationRepository,
    MongoGrooveCastRepository,
    MongoCommentRepository,
    MongoMessageRepository,
    MongoFeedRepository,
    MongoTicketRepository,
    EventMapper,
    AuthModule,
    GeolocationService,
    ConfigService,
    GroovecastService,
    BcryptService,
    UserService,
    CommentService,
    ProfileService,
    MessageService,
    TicketsService,
    QdrantService,
    CommunityService,
  ],
})
export class InfrastructureModule {}
