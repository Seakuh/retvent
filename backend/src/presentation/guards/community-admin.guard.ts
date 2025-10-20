import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CommunityService } from '../../application/services/community.service';

@Injectable()
export class CommunityAdminGuard implements CanActivate {
  constructor(
    private readonly communityService: CommunityService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
    const communityId = request.body.communityId;
    const community = await this.communityService.findById(communityId);
    if (!community) {
      console.log('Community not found');
      return false;
    }
    return community.admins.includes(user.sub);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
