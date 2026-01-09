import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Community } from 'src/core/domain/community';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
import { MongoUserRepository } from 'src/infrastructure/repositories/mongodb/user.repository';
import { CreateCommunityDto } from 'src/presentation/dtos/create-community.dto';
import { UpdateCommunityDto } from 'src/presentation/dtos/update-community.dto';
import { MongoCommunityRepository } from '../../infrastructure/repositories/mongodb/community.repository';
import { EventService } from './event.service';
import { PostService } from '../../infrastructure/services/post.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: MongoCommunityRepository,
    private readonly userRepository: MongoUserRepository,
    private readonly profileRepository: MongoProfileRepository,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    private readonly postService: PostService,
  ) {}

  async getCommunities() {
    return this.communityRepository.findAll();
  }

  async createCommunity(body: CreateCommunityDto, userId?: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const communityData = {
      ...body,
      admins: [userId],
      moderators: [userId],
      creatorId: userId || null,
      members: [userId],
      bannedUsers: [],
      eventIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.communityRepository.createCommunity(communityData);
  }

  async joinCommunity(
    { communityId }: { communityId: string },
    userId: string,
  ) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return this.communityRepository.joinCommunity(communityId, userId);
  }

  async getMembers(communityId: string) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const members = await this.profileRepository.findByIds(community.members);

    return members.map((member) => ({
      id: member.userId,
      username: member.username,
      email: member.email || '',
      profileImageUrl: member.profileImageUrl,
    }));
  }

  async findById(id: string): Promise<Community | null> {
    const community = await this.communityRepository.findById(id);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  updateCommunity(communityId: string, body: UpdateCommunityDto) {
    return this.communityRepository.update(communityId, body);
  }

  addModerator(communityId: string, userId: string) {
    return this.communityRepository.addModerator(communityId, userId);
  }

  addMember(communityId: string, userId: string) {
    return this.communityRepository.addMember(communityId, userId);
  }

  removeModerator(communityId: string, userId: string) {
    return this.communityRepository.removeModerator(communityId, userId);
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    if (!community.admins.includes(userId)) {
      throw new ForbiddenException('You are not the admin of this community');
    }
    return this.communityRepository.delete(communityId);
  }

  async addEventToCommunity(communityId: string, eventId: string): Promise<Community | null> {
    return this.communityRepository.addEventToCommunity(communityId, eventId);
  }

  async removeEventFromCommunity(communityId: string, eventId: string): Promise<Community | null> {
    return this.communityRepository.removeEventFromCommunity(communityId, eventId);
  }

  async checkUserCanCreateEvent(communityId: string, userId: string): Promise<boolean> {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community.moderators.includes(userId) || community.admins.includes(userId);
  }

  /**
   * Pinnt ein Event an die Community-Posts (nur für Admins)
   * Überprüft, ob der User Admin der Community ist, bevor das Event gepinnt wird.
   * 
   * @param communityId - ID der Community
   * @param eventId - ID des Events, das gepinnt werden soll
   * @param userId - ID des Users, der die Aktion ausführt
   * @returns Aktualisierte Community oder null wenn nicht gefunden
   * @throws ForbiddenException wenn der User kein Admin ist
   * @throws NotFoundException wenn die Community nicht gefunden wird
   */
  async pinEventToCommunity(
    communityId: string,
    eventId: string,
    userId: string,
  ): Promise<Community | null> {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (!community.admins.includes(userId)) {
      throw new ForbiddenException(
        'Only admins can pin events to community posts',
      );
    }

    return this.communityRepository.pinEventToCommunity(communityId, eventId);
  }

  /**
   * Entfernt ein Event aus den gepinnten Events einer Community (nur für Admins)
   * 
   * @param communityId - ID der Community
   * @param eventId - ID des Events, das entpinnt werden soll
   * @param userId - ID des Users, der die Aktion ausführt
   * @returns Aktualisierte Community oder null wenn nicht gefunden
   * @throws ForbiddenException wenn der User kein Admin ist
   * @throws NotFoundException wenn die Community nicht gefunden wird
   */
  async unpinEventFromCommunity(
    communityId: string,
    eventId: string,
    userId: string,
  ): Promise<Community | null> {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (!community.admins.includes(userId)) {
      throw new ForbiddenException(
        'Only admins can unpin events from community posts',
      );
    }

    return this.communityRepository.unpinEventFromCommunity(
      communityId,
      eventId,
    );
  }

  /**
   * Gibt alle gepinnten Events einer Community zurück
   * 
   * @param communityId - ID der Community
   * @returns Array von Event-Objekten
   * @throws NotFoundException wenn die Community nicht gefunden wird
   */
  async getPinnedEvents(communityId: string) {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const pinnedEventIds = community.pinnedEventIds || [];
    if (pinnedEventIds.length === 0) {
      return [];
    }

    // Hole alle gepinnten Events
    const events = await Promise.all(
      pinnedEventIds.map((id) => this.eventService.getEventById(id)),
    );

    return events.filter((event) => event !== null);
  }

  /**
   * Gibt die Dashboard-Daten für eine Community zurück
   * Enthält gepinnte Events und neueste Posts (beide optional)
   * 
   * @param communityId - ID der Community
   * @param options - Optionale Parameter für Posts (offset, limit)
   * @returns Objekt mit gepinnten Events und neuesten Posts
   * @throws NotFoundException wenn die Community nicht gefunden wird
   */
  async getCommunityDashboard(
    communityId: string,
    options?: {
      includePinnedEvents?: boolean;
      includeLatestPosts?: boolean;
      postsOffset?: number;
      postsLimit?: number;
    },
  ) {
    const community = await this.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const {
      includePinnedEvents = true,
      includeLatestPosts = true,
      postsOffset = 0,
      postsLimit = 20,
    } = options || {};

    const result: {
      pinnedEvents?: any[];
      latestPosts?: any[];
    } = {};

    // Hole gepinnte Events wenn gewünscht
    if (includePinnedEvents) {
      result.pinnedEvents = await this.getPinnedEvents(communityId);
    }

    // Hole neueste Posts wenn gewünscht
    if (includeLatestPosts) {
      result.latestPosts = await this.postService.getCommunityPosts(
        communityId,
        postsOffset,
        postsLimit,
      );
    }

    return result;
  }
}
