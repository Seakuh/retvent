import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommunityService } from '../../application/services/community.service';
@Injectable()
export class CommunityHostGuard implements CanActivate {
  constructor(private readonly communityService: CommunityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const communityId = request.body.communityId;
    const community = await this.communityService.findById(communityId);
    if (!community) {
      return false;
    }
    return community.moderators.includes(user.id);
  }
}
