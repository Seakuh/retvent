import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret =
      configService.get<string>('JWT_SECRET') || 'SuperSichererSchluessel';
    console.log('JWT Strategy - Using secret:', jwtSecret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    try {
      if (!payload) {
        console.log('JWT Strategy - No payload found');
        throw new UnauthorizedException('Invalid token payload');
      }

      if (!payload.sub) {
        console.log('JWT Strategy - No sub (user id) found in payload');
        throw new UnauthorizedException('Invalid token structure');
      }

      const user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      console.log('JWT Strategy - Validated user:', user);
      return user;
    } catch (error) {
      console.error('JWT Strategy - Validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
