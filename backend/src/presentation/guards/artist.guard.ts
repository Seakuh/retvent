import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ArtistGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Nicht authentifiziert');
    }

    if (!user.isArtist) {
      throw new ForbiddenException('Nur für Künstler verfügbar');
    }

    return true;
  }
} 