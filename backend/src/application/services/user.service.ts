import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto.';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: MongoUserRepository) {}

  update(id: string, updateUserDto: UpdateUserDto) {
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

  async getProfileInfo(id: string) {
    return this.userRepository.getProfileInfo(id);
  }
}
