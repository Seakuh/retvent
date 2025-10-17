import { Controller, Get } from '@nestjs/common';
import { CommunityService } from '../../application/services/community.service';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('communities')
  async getCommunities() {
    return this.communityService.getCommunities();
  }
}
