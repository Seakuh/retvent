import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MongoUserRepository } from '../../infrastructure/repositories/mongodb/user.repository';
import { RegisterDto, LoginDto } from '../../domain/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: MongoUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword
    });

    // Generate token
    const token = this.jwtService.sign({ 
      id: user.id,
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.jwtService.sign({ 
      id: user.id,
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }
} 