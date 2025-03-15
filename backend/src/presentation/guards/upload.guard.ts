import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UploadGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      console.log('UploadGuard - No authorization header found');
      throw new UnauthorizedException('No authorization header');
    }

    try {
      const token = authHeader.split(' ')[1];
      console.log('UploadGuard - Attempting to verify token');

      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        'SuperSichererSchluessel';
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      console.log('UploadGuard - Token verified, payload:', payload);

      // Füge den dekodierten User zum Request hinzu
      request.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      return true;
    } catch (error) {
      console.error('UploadGuard - Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
