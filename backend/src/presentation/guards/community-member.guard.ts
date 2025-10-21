import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CommunityService } from '../../application/services/community.service';

@Injectable()
export class CommunityMemberGuard implements CanActivate {
  constructor(
    private readonly communityService: CommunityService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    console.log('=== COMMUNITY MEMBER GUARD DEBUG ===');
    console.log('request.user', request.user);
    console.log('request.body', request.body);
    console.log('request.body.communityId', request.body?.communityId);
    console.log('request.headers', request.headers);

    const communityId = request.body?.communityId;

    if (!communityId) {
      console.log('ERROR: communityId is missing from request.body');
      console.log('Full request.body:', JSON.stringify(request.body));
      return false;
    }

    console.log('Looking for community with ID:', communityId);
    const community = await this.communityService.findById(communityId);
    if (!community) {
      console.log('ERROR: Community not found with ID:', communityId);
      return false;
    }
    console.log('Community found:', community.name);
    return community.members.includes(request.user.sub);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
