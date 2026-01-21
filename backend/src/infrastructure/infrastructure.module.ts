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
import { VoiceChatService } from 'src/application/services/voice-chat/voice-chat.service';
import { MessageSchema } from 'src/core/domain/message.schema';
import { TicketSchema } from 'src/core/domain/ticket.schema';
import { PeerAssessmentSchema } from 'src/core/domain/peer-assessment.schema';
import { SelfAssessmentSchema } from 'src/core/domain/self-assessment.schema';
import { ArtistController } from 'src/presentation/controllers/artist.controller';
import { CommentController } from 'src/presentation/controllers/comment.controller';
import { FeedController } from 'src/presentation/controllers/feed.controller';
import { GroovecastController } from 'src/presentation/controllers/groovecast.controller';
import { MessageController } from 'src/presentation/controllers/message.controller';
import { PostsController } from 'src/presentation/controllers/posts.controller';
import { SearchController } from 'src/presentation/controllers/search.controller';
import { TicketsController } from 'src/presentation/controllers/tickets.controller';
import { UserController } from 'src/presentation/controllers/user.controller';
import { VoiceChatController } from 'src/presentation/controllers/voice-chat.controller';
import { VoiceChatGateway } from 'src/presentation/gateways/voice-chat.gateway';
import { EventMapper } from '../application/mappers/event.mapper';
import { EventService } from '../application/services/event.service';
import { LocationService } from '../application/services/location.service';
import { RegistrationService } from '../application/services/registration.service';
import { UserService } from '../application/services/user.service';
import { CoreModule } from '../core/core.module';
import { BcryptService } from '../core/services/bcrypt.service';
import { AssessmentController } from '../presentation/controllers/assessment.controller';
import { AuthController } from '../presentation/controllers/auth.controller';
import { EventController } from '../presentation/controllers/event.controller';
import { GroupController } from '../presentation/controllers/group.controller';
import { LocationController } from '../presentation/controllers/location.controller';
import { RegistrationController } from '../presentation/controllers/registration.controller';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { OwnerGuard } from '../presentation/guards/owner.guard';
import { CommunityEventGuard } from '../presentation/guards/community-event.guard';
import { AuthModule } from './modules/auth.module';
import { MongoCommentRepository } from './repositories/mongodb/comment.repository';
import { MongoCommunityRepository } from './repositories/mongodb/community.repository';
import { MongoEventRepository } from './repositories/mongodb/event.repository';
import { MongoFeedRepository } from './repositories/mongodb/feed.repository';
import { MongoGrooveCastRepository } from './repositories/mongodb/groovecast.repository';
import { MongoGroupRepository } from './repositories/mongodb/group.repository';
import { MongoLocationRepository } from './repositories/mongodb/location.repository';
import { MongoMessageRepository } from './repositories/mongodb/message.repository';
import { MongoPostRepository } from './repositories/mongodb/post.repository';
import { MongoProfileRepository } from './repositories/mongodb/profile.repository';
import { MongoTicketRepository } from './repositories/mongodb/ticket.repository';
import { MongoUserRepository } from './repositories/mongodb/user.repository';
import { CommentSchema } from './schemas/comment.schema';
import { CommunitySchema } from './schemas/community.schema';
import { EventSchema } from './schemas/event.schema';
import { FeedSchema } from './schemas/feed.schame';
import { GroovecastSchema } from './schemas/groovecast.schema';
import { GroupSchema } from './schemas/group.schmema';
import { LocationSchema } from './schemas/location.schema';
import { PostSchema } from './schemas/post.schema';
import { ProfileSchema } from './schemas/profile.schema';
import { UserSchema } from './schemas/user.schema';
import { AuthService } from './services/auth.service';
import { ChatGPTService } from './services/chatgpt.service';
import { GeolocationService } from './services/geolocation.service';
import { GroovecastService } from './services/groovecast.service';
import { ImageService } from './services/image.service';
import { DocumentService } from './services/document.service';
import { MuxService } from './services/mux.service';
import { PostService } from './services/post.service';
import { QdrantService } from './services/qdrant.service';
import { ReplicateService } from './services/replicate.service';
import { VideoService } from './services/video.service';
import { SMTPServerService } from './services/smtp-server.service';
import { IMAPMailService } from './services/imap-mail.service';
import { SlugService } from './services/slug.service';
import { AiEnrichmentService } from './services/ai-enrichment.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SitemapController } from '../presentation/controllers/sitemap.controller';
import { PokerGameService } from 'src/application/services/poker-game.service';
import { PokerGameSchema } from 'src/core/domain/poker-game.schema';
import { PokerStatsService } from 'src/application/services/poker-stats.service';
import { PokerInvitationService } from 'src/application/services/poker-invitation.service';
import { PokerStatsSchema } from 'src/core/domain/poker-stats.schema';
import { PokerInvitationSchema } from 'src/core/domain/poker-invitation.schema';
import { MailController } from 'src/presentation/controllers/mail.controller';
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
      { name: 'PokerGame', schema: PokerGameSchema },
      { name: 'Comment', schema: CommentSchema },
      { name: 'Profile', schema: ProfileSchema },
      { name: 'Feed', schema: FeedSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'PokerStats', schema: PokerStatsSchema },
      { name: 'PokerInvitation', schema: PokerInvitationSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Community', schema: CommunitySchema },
      { name: 'Post', schema: PostSchema },
      { name: 'PeerAssessment', schema: PeerAssessmentSchema },
      { name: 'SelfAssessment', schema: SelfAssessmentSchema },
    ]),
  ],
  controllers: [
    AuthController,
    LocationController,
    EventController,
    GroovecastController,
    CommentController,
    PostsController,
    UserController,
    SearchController,
    RegistrationController,
    GroupController,
    VoiceChatController,
    MessageController,
    MailController,
    FeedController,
    AssessmentController,
    ArtistController,
    TicketsController,
    SitemapController,
  ],
  providers: [
    RegistrationService,
    EventService,
    ProfileService,
    CommentService,
    GroupService,
    MessageService,
    ChatGPTService,
    MailService,
    SMTPServerService,
    IMAPMailService,
    PostService,
    TicketsService,
    FeedService,
    VoiceChatService,
    VoiceChatGateway,
    EventEmbeddingService,
    ImageService,
    DocumentService,
    AssessmentService,
    VideoService,
    MuxService,
    ReplicateService,
    GeolocationService,
    LocationService,
    AuthService,
    PokerGameService,
    PokerStatsService,
    PokerInvitationService,
    MongoEventRepository,
    MongoCommunityRepository,
    MongoGroupRepository,
    MongoLocationRepository,
    BotService,
    MongoUserRepository,
    MongoGrooveCastRepository,
    MongoCommentRepository,
    MongoCommunityRepository,
    MongoProfileRepository,
    MongoMessageRepository,
    MongoPostRepository,
    MongoFeedRepository,
    MongoTicketRepository,
    JwtStrategy,
    JwtAuthGuard,
    OwnerGuard,
    CommunityEventGuard,
    EventMapper,
    ConfigService,
    CommunityService,
    BcryptService,
    UserService,
    GroovecastService,
    QdrantService,
    SlugService,
    AiEnrichmentService,
    {
      provide: 'IEventRepository',
      useClass: MongoEventRepository,
    },
    {
      provide: 'ICommunityRepository',
      useClass: MongoCommunityRepository,
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
    {
      provide: 'IPostRepository',
      useClass: MongoPostRepository,
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
    VoiceChatService,
    ImageService,
    DocumentService,
    AssessmentService,
    VideoService,
    MuxService,
    ReplicateService,
    MailService,
    ChatGPTService,
    JwtAuthGuard,
    OwnerGuard,
    CommunityEventGuard,
    'IEventRepository',
    'ICommunityRepository',
    'ILocationRepository',
    'IUserRepository',
    'ICommentRepository',
    'IProfileRepository',
    'IGroupRepository',
    'IPostRepository',
    'IMessageRepository',
    'IFeedRepository',
    'ITicketRepository',
    JwtModule,
    MongoEventRepository,
    MongoCommunityRepository,
    MongoProfileRepository,
    MongoLocationRepository,
    MongoPostRepository,
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
    PostService,
    RegistrationService,
    CommentService,
    ProfileService,
    MessageService,
    PokerGameService,
    PokerStatsService,
    PokerInvitationService,
    TicketsService,
    QdrantService,
    CommunityService,
  ],
})
export class InfrastructureModule {}
