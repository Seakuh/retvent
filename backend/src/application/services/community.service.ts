import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunityService {
  constructor() {}

  async getCommunities() {
    return 'Communities';
  }
}
