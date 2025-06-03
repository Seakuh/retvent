import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, UserPreferences } from '../../../core/domain/profile';
import { IProfileRepository } from '../../../core/repositories/profile.repository.interface';

@Injectable()
export class MongoProfileRepository implements IProfileRepository {
  getProfileByName(name: string) {
    return this.profileModel.findOne({ username: name });
  }
  getAllProfiles(limit: number, offset: number): Promise<Profile[]> {
    return this.profileModel.find().skip(offset).limit(limit).exec();
  }
  constructor(
    @InjectModel('Profile') private readonly profileModel: Model<Profile>,
  ) {}

  findBySlug(slug: string): Promise<Profile | null> {
    throw new Error('Method not implemented.');
  }
  findByHostId(hostId: string): Promise<Event[]> {
    throw new Error('Method not implemented.');
  }
  updateProfileGallery(id: string, fileUrls: string[]): Promise<Profile> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { gallery: fileUrls },
      { new: true },
    );
  }

  searchProfilesByQuery(query: string): Profile[] | PromiseLike<Profile[]> {
    return this.profileModel.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    });
  }

  findAllLatest() {
    return this.profileModel.find().sort({ createdAt: -1 }).exec();
  }

  findByIds(ids: string[]) {
    return this.profileModel.find({ userId: { $in: ids } });
  }

  getProfileFeed(
    id: string,
    limit: number,
    offset: number,
  ): Profile[] | PromiseLike<Profile[]> {
    throw new Error('Method not implemented.');
  }

  updateProfileEmbedding(id: any, embedding: number[]) {
    return this.profileModel.findByIdAndUpdate(
      id,
      { embedding: embedding },
      { new: true },
    );
  }

  findSponsoredProfiles(limit: number) {
    return this.profileModel
      .find({
        isSponsored: true,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  findMissingProfileEmbeddings(BATCH_SIZE: number) {
    return this.profileModel
      .find({ userId: { $exists: true } })
      .find({ preferences: { $exists: true } })
      .find({ embedding: { $exists: false } })
      .limit(BATCH_SIZE)
      .sort({ createdAt: 1 })
      .exec();
  }

  async updateProfilePreferences(
    id: string,
    preferences: UserPreferences,
  ): Promise<Profile> {
    return await this.profileModel
      .findOneAndUpdate(
        { userId: id },
        {
          $set: {
            preferences: preferences,
          },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  async findById(id: string): Promise<Profile | null> {
    // when no points are set, set them to 0
    console.log('findById - id:', id);
    const profile = await this.profileModel.findById(id);
    if (profile && !profile.get('points')) {
      profile.set('points', 0);
      await profile.save();
    }
    return profile;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.profileModel.findOne({
      username: {
        $regex: username,
        $options: 'i', // Case-insensitive
      },
    });
  }

  async create(profile: Profile): Promise<Profile> {
    return this.profileModel.create(profile);
  }

  async update(
    userId: string,
    profileData: Partial<Profile>,
  ): Promise<Profile | null> {
    // Erst das Profil anhand der userId finden
    const profile = await this.profileModel.findOne({ userId });

    if (!profile) {
      return null;
    }

    // Nur die mitgegebenen, nicht-null Felder filtern
    const updateFields = Object.fromEntries(
      Object.entries(profileData).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    // Update durchführen mit den gefilterten Feldern
    return this.profileModel.findByIdAndUpdate(
      profile._id,
      { $set: updateFields },
      { new: true },
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.profileModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOne({ $or: [{ username }, { email }] });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileModel.findOne({ email });
  }

  async updateProfilePicture(
    userId: string,
    profileImageUrl: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          profileImageUrl: profileImageUrl || null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async updateHeaderPicture(
    userId: string,
    headerImageUrl: string,
  ): Promise<Profile | null> {
    return this.profileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          headerImageUrl: headerImageUrl || null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async updateProfileLinks(
    id: string,
    links: string[],
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(id, { links }, { new: true });
  }

  async updateProfileDoorPolicy(
    id: string,
    doorPolicy: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { doorPolicy },
      { new: true },
    );
  }

  async updateProfileCategory(
    id: string,
    category: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(id, { category }, { new: true });
  }

  async addFollower(
    profileId: string,
    followerId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      profileId,
      {
        $addToSet: { followers: followerId },
        $inc: { followerCount: 1 }, // Erhöht den Counter automatisch
      },
      { new: true },
    );
  }

  async removeFollower(
    profileId: string,
    followerId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      profileId,
      {
        $pull: { followers: followerId },
        $inc: { followerCount: -1 }, // Verringert den Counter automatisch
      },
      { new: true },
    );
  }

  async getFollowerCount(profileId: string): Promise<number> {
    const profile = await this.profileModel
      .findById(profileId)
      .select('followerCount');
    return profile?.followerCount || 0;
  }

  async addCreatedEvent(
    userId: string,
    eventId: string,
  ): Promise<Profile | null> {
    return this.profileModel.findByIdAndUpdate(
      userId,
      { $push: { createdEventIds: eventId } },
      { new: true },
    );
  }

  // ----------------------------------------------- Artist
  async createNewArtist(artistProfile: Partial<Profile>, userId: string) {
    console.log('createNewArtist - artistProfile:', artistProfile);
    // const existingArtist = await this.profileModel.findOne({
    //   username: artistProfile.username,
    // });
    // if (existingArtist) {
    //   throw new BadRequestException('Artist already exists');
    // }

    const newArtist = await this.profileModel.create({
      ...artistProfile,
      userId: userId,
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('newArtist', newArtist);
    return newArtist;
  }

  searchProfiles(query: string): Profile[] | PromiseLike<Profile[]> {
    // Normalisiere den Suchbegriff
    const normalizedQuery = query.toLowerCase().trim();

    // Erstelle ein Regex-Pattern für Tippfehler
    // Erlaubt 1-2 Buchstaben Unterschied
    const searchRegex = new RegExp(
      `^${normalizedQuery.split('').join('.*')}.*$`,
      'i',
    );

    return this.profileModel
      .find({
        $or: [
          { username: searchRegex },
          // Füge eine Levenshtein-Distanz-Bedingung hinzu
          {
            $expr: {
              $lte: [
                {
                  $strLenCP: {
                    $reduce: {
                      input: { $range: [0, { $strLenCP: '$username' }] },
                      initialValue: 0,
                      in: {
                        $add: [
                          '$$value',
                          {
                            $cond: {
                              if: {
                                $ne: [
                                  { $substr: ['$username', '$$this', 1] },
                                  { $substr: [normalizedQuery, '$$this', 1] },
                                ],
                              },
                              then: 1,
                              else: 0,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                2, // Maximale Anzahl erlaubter Unterschiede
              ],
            },
          },
        ],
      })
      .exec();
  }
}
