import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../infrastructure/services/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Prüfe erst den Standard JWT Guard
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    // Prüfe ob der Token in der Blacklist ist
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (token && this.authService.isTokenBlacklisted(token)) {
      return false;
    }

    return true;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Nicht authentifiziert');
    }
    return user;
  }
} 