import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../core/domain/user';
import { BcryptService } from '../../core/services/bcrypt.service';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { RegisterUserDto } from '../../presentation/dtos/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  async registerWithProfile(registerDto: RegisterUserDto) {
    const { email, password, username } = registerDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.bcryptService.hash(password);

    const user = await this.userModel.create({
      email,
      username,
      password: hashedPassword,
    });
  }

  async register(registerDto: RegisterUserDto) {
    const { email, password, username } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await this.bcryptService.hash(password);

    // Create user
    const user = await this.userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  }

  async validateUser(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  private tokenBlacklist: Set<string> = new Set();

  async logout(token: string): Promise<void> {
    this.tokenBlacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }
}
