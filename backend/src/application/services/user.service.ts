import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileInfoDto } from 'src/presentation/dtos/profile.dto';
import { UpdateUserProfileDto } from 'src/presentation/dtos/update-user.dto';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';
import { ProfileService } from './profile.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: MongoUserRepository,
    private readonly profileService: ProfileService,
  ) {}

  update(id: string, updateUserDto: UpdateUserProfileDto) {
    return this.userRepository.update(id, updateUserDto);
  }
  findByEmailOrUsername(email: string, username: string) {
    return this.userRepository.findByEmailOrUsername(email, username);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async getProfileInfo(userId: string): Promise<ProfileInfoDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    // Profilinformationen vom ProfileService holen
    const profileData = await this.profileService.getProfileByUserId(userId);

    // User-Daten und Profil-Daten kombinieren
    const { password: _, ...userWithoutPassword } = user;
    return {
      id: user.id,
      profileImageUrl: profileData.profileImageUrl || null,
      ...userWithoutPassword,
      ...profileData,
    } as ProfileInfoDto;
  }
}
