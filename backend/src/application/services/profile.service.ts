import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UploadedFile,
} from '@nestjs/common';
import {
  Profile,
  ProfileEventDetail,
  UserPreferences,
} from 'src/core/domain/profile';
import { MongoProfileRepository } from 'src/infrastructure/repositories/mongodb/profile.repository';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { ImageService } from 'src/infrastructure/services/image.service';
import { CreateArtistDto } from 'src/presentation/dtos/create-artist.dto';
import { QdrantService } from 'src/infrastructure/services/qdrant.service';
@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: MongoProfileRepository,
    private readonly imageService: ImageService,
    private readonly chatGptService: ChatGPTService,
    private readonly qdrantService: QdrantService,
  ) {}

  getAllProfiles(limit: number, offset: number): Promise<Profile[]> {
    return this.profileRepository.getAllProfiles(limit, offset);
  }
  updateProfileEmbedding(id: any, embedding: number[]) {
    return this.profileRepository.updateProfileEmbedding(id, embedding);
  }
  async updateProfileGallery(
    id: string,
    gallery: Express.Multer.File[],
  ): Promise<Profile> {
    const fileUrls = await Promise.all(
      gallery.map(async (file) => {
        const fileUrl = await this.imageService.uploadImage(file);
        return fileUrl;
      }),
    );
    return this.profileRepository.updateProfileGallery(id, fileUrls);
  }
  getProfileByUserId(userId: string): Promise<Profile> {
    return this.profileRepository.findByUserId(userId);
  }
  async getProfileById(id: string): Promise<Profile> {
    return this.profileRepository.findByUserId(id);
  }

  async getProfileByUsername(username: string): Promise<Profile> {
    return this.profileRepository.findByUsername(username);
  }

  findMissingProfileEmbeddings(BATCH_SIZE: number) {
    return this.profileRepository.findMissingProfileEmbeddings(BATCH_SIZE);
  }

  async getProfileByName(name: string) {
    const profile = await this.profileRepository.getProfileByName(name);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async getUsernameAndProfilePicture(userId: string) {
    const profile =
      await this.profileRepository.findByUsernameAndProfilePicture(userId);
    return {
      username: profile?.username ?? '',
      profileImageUrl: profile?.profileImageUrl ?? '',
    };
  }
  // createArtistContact(createArtistDto: CreateArtistDto) {
  //   const artistContact = await this.profileRepository.createArtistContact(
  //     createArtistDto,
  //   );
  //   return artistContact;
  // }

  async getArtistByName(name: string) {
    const profile = await this.profileRepository.getProfileByName(name);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async createNewArtist(
    image: Express.Multer.File,
    createArtistDto: CreateArtistDto,
    userId: string,
  ): Promise<Profile> {
    console.log('createArtistDto', createArtistDto);
    console.log('image', image);
    const imageUrl = await this.imageService.uploadImage(image);
    const artistProfile = await this.chatGptService.generateArtistProfile(
      createArtistDto.prompt,
    );

    const profile = await this.profileRepository.createNewArtist(
      {
        ...artistProfile,
        username: createArtistDto.name,
        profileImageUrl: imageUrl,
        isArtist: true,
        userId,
      },
      userId,
    );
    return profile;
  }

  async createNewArtistV2(
    image: Express.Multer.File,
    createArtistDto: CreateArtistDto,
    userId: string,
  ): Promise<[Profile, string, string, string]> {
    console.log('createArtistDto', createArtistDto);
    console.log('image', image);
    const imageUrl = await this.imageService.uploadImage(image);
    const artistProfile = await this.chatGptService.generateArtistProfile(
      createArtistDto.prompt,
    );

    const description = await this.chatGptService.generateArtistDescription(
      createArtistDto.prompt,
    );

    const createdEmail = await this.chatGptService.generateRequestEmail(
      createArtistDto.prompt,
    );

    const announcement = await this.chatGptService.generateAnnouncement(
      createArtistDto.prompt,
    );

    const profile = await this.profileRepository.createNewArtist(
      {
        ...artistProfile,
        username: createArtistDto.name,
        profileImageUrl: imageUrl,
        isArtist: true,
        userId,
      },
      userId,
    );
    console.log('---------------------__>profile', profile);
    console.log('---------------------__>description', description);
    console.log('---------------------__>createdEmail', createdEmail);
    console.log('---------------------__>announcement', announcement);

    return [profile, description, createdEmail, announcement];
  }

  async getEventProfile(id: string): Promise<ProfileEventDetail> {
    const profile = await this.profileRepository.findByUserId(id);
    if (!profile) {
      return null;
    }
    return {
      profileImageUrl: profile.profileImageUrl,
      username: profile.username,
    };
  }

  async setProfilePreferences(
    id: string,
    preferences: UserPreferences,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(id);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Embedding für die neuen Präferenzen erstellen
    // const preferencesEmbedding =
    //   await this.eventEmbeddingService.createEmbeddingFromPreferences(
    //     preferences,
    //   );
    console.log('preferences', preferences);
    console.log('profile', profile);
    // Profil mit neuen Präferenzen und Embedding aktualisieren
    const updatedProfile =
      await this.profileRepository.updateProfilePreferences(id, preferences);
    // await this.updateProfileEmbedding(id, preferencesEmbedding);

    console.log(updatedProfile);
    return updatedProfile;
  }

  async getProfilePreferences(id: string): Promise<UserPreferences> {
    const profile = await this.profileRepository.findByUserId(id);
    return profile.preferences;
  }

  createPreferencesEmbeddings(preferences: UserPreferences): UserPreferences {
    return preferences;
  }

  async createProfile(profile: Profile): Promise<Profile> {
    return this.profileRepository.create(profile);
  }

  async updateProfile(id: string, profile: Profile): Promise<Profile> {
    return this.profileRepository.update(id, profile);
  }

  async deleteProfile(id: string): Promise<boolean> {
    return this.profileRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findByUserId(userId);
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.profileRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileRepository.findByEmail(email);
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<Profile | null> {
    return this.profileRepository.findByUsernameOrEmail(username, email);
  }

  async updateProfilePicture(
    id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile | null> {
    try {
      const fileUrl = await this.imageService.uploadImage(file);
      return this.profileRepository.updateProfilePicture(id, fileUrl);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error('Error updating profile picture');
    }
  }

  async findSponsoredProfiles(limit: number) {
    return this.profileRepository.findSponsoredProfiles(limit);
  }

  async updateHeaderPicture(
    id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile | null> {
    try {
      const fileUrl = await this.imageService.uploadImage(file);
      return this.profileRepository.updateHeaderPicture(id, fileUrl);
    } catch (error) {
      console.error('Error updating header picture:', error);
      throw new Error('Error updating header picture');
    }
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileLinks(id, links);
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileDoorPolicy(id, doorPolicy);
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<Profile | null> {
    return this.profileRepository.updateProfileCategory(id, category);
  }

  async addCreatedEvent(
    userId: string,
    eventId: string,
  ): Promise<Profile | null> {
    return this.profileRepository.addCreatedEvent(userId, eventId);
  }

  getProfilePageByUsername(slug: string): Profile | PromiseLike<Profile> {
    throw new Error('Method not implemented.');
  }
  getProfilePageById(slug: string): Profile | PromiseLike<Profile> {
    throw new Error('Method not implemented.');
  }
  async searchProfiles(query: string): Promise<Profile[]> {
    return this.profileRepository.searchProfiles(query);
  }
  async searchProfilesByQuery(query: string): Promise<Profile[]> {
    return this.profileRepository.searchProfilesByQuery(query);
  }

  // ------------------------------------------------------------
  // Share Profile
  // ------------------------------------------------------------
  async shareProfile(profileId: string, userId: string) {
    const profile = await this.profileRepository.findByUserId(profileId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to share this profile',
      );
    }
    return this.profileRepository.getSharedProfile(profileId, userId);
  }

  // ------------------------------------------------------------
  // Connect with Profile
  // ------------------------------------------------------------
  async connectWithProfile(profileId: string, userId: string) {
    const profile = await this.profileRepository.findByUserId(profileId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
  }

  async findByIds(memberIds: string[]) {
    return this.profileRepository.findByIds(memberIds);
  }


  // ------------------------------------------------------------
  // Poker Onboarding
  // ------------------------------------------------------------

  async setPokerOnboarding(onboarding: any, userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const vector = await this.chatGptService.createEmbedding(onboarding);

    return this.qdrantService.upsertUsers([{
      id: userId,
      vector: onboarding.vector,
      payload: onboarding,
    }]);
  }

  async getPokerOnboarding() {
    return {
      "general": {
        "language": [
          "English",
          "German",
          "Spanish",
          "French",
          "Other"
        ],
        "time_zone": [
          "UTC-8",
          "UTC-5",
          "UTC",
          "UTC+1",
          "UTC+2",
          "UTC+3",
          "UTC+8"
        ],
        "poker_experience_level": [
          "Complete Beginner",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Professional"
        ],
        "years_of_experience": [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6+"
        ],
        "game_type_preference": [
          "Cash Games",
          "Tournaments (MTT)",
          "Sit & Go",
          "Online Poker",
          "Live Poker"
        ]
      },
    
      "coachee_profile": {
        "goals": [
          "Improve Fundamentals",
          "Fix Leaks",
          "Move Up Stakes",
          "Improve MTT Performance",
          "Improve Live Poker Skills",
          "Strengthen Mental Game",
          "Learn GTO",
          "Become Professional",
          "Improve Content Creation"
        ],
        "learning_preferences": [
          "Visual (Videos)",
          "Theory Focused",
          "Hands-on / Drills",
          "Session Review Based",
          "Data Analysis"
        ],
        "commitment_level": [
          "Casual",
          "Ambitious",
          "Serious",
          "Professional Track"
        ]
      },
    
      "coach_profile": {
        "specialization": [
          "No-Limit Hold'em",
          "Pot-Limit Omaha",
          "MTT Strategy",
          "Cash Game Strategy",
          "Short Deck",
          "Mixed Games",
          "GTO / Solver Training",
          "Exploitative Strategy",
          "Live Poker Strategy",
          "ICM / Tournament Endgame",
          "Mental Game Coaching",
          "Bankroll Management"
        ],
        "coaching_format": [
          "1-on-1 Coaching",
          "Group Coaching",
          "Hand Review",
          "Session Review (Live)",
          "Session Review (Video)",
          "Range/Preflop Coaching",
          "Long-term Mentorship Program"
        ],
        "coaching_level": [
          "Beginner",
          "Intermediate",
          "Advanced",
          "High Stakes",
          "Professional"
        ],
        "price_model": [
          "Hourly Rate",
          "Package Deals",
          "Revenue Share",
          "Stake / Backing Deal",
          "Subscription Model",
          "Affiliate/Commission Based"
        ],
        "verification": [
          "HendonMob Results",
          "Online Results Verified",
          "Sample Content",
          "Coaching Certificate",
          "Reputation Score"
        ]
      },
    
      "business_context": {
        "role": [
          "Player",
          "Coach",
          "Backer",
          "Content Creator",
          "Poker Analyst",
          "Academy Owner",
          "Brand / Casino Representative"
        ],
        "deal_types": [
          "One-time Project",
          "Long-term Partnership",
          "Percentage Deal",
          "Fixed Contract",
          "Flexible Agreement"
        ],
        "reputation_metrics": [
          "Community Rating",
          "Verified Identity",
          "Track Record",
          "Professional References"
        ]
      },
    
      "business_interests": [
        "Offering Coaching",
        "Seeking Coaching",
        "Seeking Backing",
        "Offering Backing",
        "Looking for Sponsoring",
        "Offering Sponsoring",
        "Content Collaboration",
        "Marketing Partnerships"
      ]
    }
    ;
  }
}
