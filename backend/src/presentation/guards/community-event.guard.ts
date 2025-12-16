import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommunityService } from 'src/application/services/community.service';

@Injectable()
export class CommunityEventGuard implements CanActivate {
  constructor(
    private readonly communityService: CommunityService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // JWT Token extrahieren
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new ForbiddenException('No authentication token provided');
    }

    const user = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    // CommunityId aus verschiedenen Quellen extrahieren
    let communityId = request.body.communityId;

    // Falls nicht im body, versuche aus params (für /community/:id/events)
    if (!communityId && request.params.communityId) {
      communityId = request.params.communityId;
    }

    // Falls aus JSON String geparst werden muss (createEventFull)
    if (!communityId && request.body.data) {
      try {
        const parsedData = typeof request.body.data === 'string'
          ? JSON.parse(request.body.data)
          : request.body.data;
        communityId = parsedData.communityId;
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Kein communityId = Personal Event = erlaubt
    if (!communityId) {
      return true;
    }

    // Community Permission Check
    const hasPermission = await this.communityService.checkUserCanCreateEvent(
      communityId,
      user.sub,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Only moderators and admins can create community events',
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
