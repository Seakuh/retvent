import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MessageSchema } from 'src/core/domain/message.schema';
import { MailService } from '../../application/services/mail.service';
import { CoreModule } from '../../core/core.module';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { UploadGuard } from '../../presentation/guards/upload.guard';
import { GroupSchema } from '../schemas/group.schmema';
import { ProfileSchema } from '../schemas/profile.schema';
import { UserSchema } from '../schemas/user.schema';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CoreModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') || 'SuperSichererSchluessel';
        console.log('Auth Module - Configuring JWT with secret:', secret);
        return {
          secret: secret,
          signOptions: {
            expiresIn: '30d',
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Profile', schema: ProfileSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(),
    },
    AuthService,
    JwtStrategy,
    UploadGuard,
    MailService,
  ],
  exports: [AuthService, JwtModule, UploadGuard],
})
export class AuthModule {}
