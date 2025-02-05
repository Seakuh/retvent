import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../core/repositories/user.repository.interface';
import { RegisterUserDto } from '../../presentation/dtos/register-user.dto';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { User } from '../../core/domain/user';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<{ user: User; access_token: string }> {
    // Prüfe ob Email oder Username bereits existiert
    const existingUser = await this.userRepository.findByEmailOrUsername(
      registerDto.email,
      registerDto.username
    );

    if (existingUser) {
      throw new ConflictException('Email oder Username bereits vergeben');
    }

    // Hash das Passwort
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Erstelle den neuen User
    const newUser = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownedLocationIds: [],
      createdEventIds: [],
      likedEventIds: [],
      likedLocationIds: [],
      followedLocationIds: [],
      performingEventIds: [],
    });

    // Entferne das Passwort aus der Rückgabe
    const { password, ...userWithoutPassword } = newUser;

    // Generiere JWT Token
    const token = this.jwtService.sign({
      sub: newUser.id,
      username: newUser.username,
    });

    return {
      user: userWithoutPassword as User,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string }> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email oder Passwort falsch');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email oder Passwort falsch');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      access_token: token,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('User nicht gefunden');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Optional: Token Blacklisting für Logout
  private tokenBlacklist: Set<string> = new Set();

  async logout(token: string): Promise<void> {
    this.tokenBlacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }
} 