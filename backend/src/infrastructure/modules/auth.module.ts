import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from '../../core/core.module';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { UploadGuard } from '../../presentation/guards/upload.guard';
import { UserSchema } from '../schemas/user.schema';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Module({
  imports: [
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
            expiresIn: '24h',
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
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
  ],
  exports: [AuthService, JwtModule, UploadGuard],
})
export class AuthModule {}
