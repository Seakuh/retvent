import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Model } from 'mongoose';
import { Profile } from '../../core/domain/profile';
import { User } from '../../core/domain/user';
import { BcryptService } from '../../core/services/bcrypt.service';
import { LoginDto, LoginV2Dto } from '../../presentation/dtos/login.dto';
import {
  RegisterUserDto,
  RegisterUserDtoV2,
} from '../../presentation/dtos/register-user.dto';
import { CommunityService } from 'src/application/services/community.service';

const POKER_COMMUNITY_ID = '68f61d3fedb3df5cdb0677f6';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Profile') private profileModel: Model<Profile>,
    private jwtService: JwtService,
    private readonly communityService: CommunityService,
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
      points: 0,
    });

    await this.profileModel.create({
      userId: user._id,
      username,
      email,
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  async registerWithProfilePoker(registerDto: RegisterUserDto) {
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
      points: 125,
    });

    await this.profileModel.create({
      userId: user._id,
      username,
      email,
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    await this.communityService.addMember(POKER_COMMUNITY_ID, user._id.toString());

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  }


  // WEB 3 ------------------------------------------------
  async registerWithProfileAndWallet(registerDto: RegisterUserDtoV2) {
    console.log('registerDto', registerDto);
    const { email, password, username, prompt } = registerDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.bcryptService.hash(password);
    const { publicKey, privateKey } = this.createSolanaWallet();

    const user = await this.userModel.create({
      email,
      username,
      password: hashedPassword,
      solanaWalletAddress: publicKey,
      solanaWalletPrivateKey: privateKey,
    });

    await this.profileModel.create({
      userId: user._id,
      username,
      email,
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
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
        solanaWalletAddress: user.solanaWalletAddress,
        solanaWalletPrivateKey: user.solanaWalletPrivateKey,
      },
    };
  }

  createSolanaWallet() {
    const keypair = Keypair.generate();

    return {
      publicKey: keypair.publicKey.toBase58(), // 🔐 Adresse für Nutzer
      privateKey: bs58.encode(keypair.secretKey), // ⚠️ Optional, sicher speichern!
    };
  }

  async registerWithProfileV2(registerDto: RegisterUserDtoV2) {
    const { email, password, username, prompt } = registerDto;

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
      points: 0,
    });

    await this.profileModel.create({
      userId: user._id,
      username,
      description: prompt,
      email,
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      points: 500,
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
        solanaWalletAddress: user.solanaWalletAddress,
        solanaWalletPrivateKey: user.solanaWalletPrivateKey,
      },
    };
  }

  async loginV2(loginDto: LoginV2Dto) {
    const { username, password } = loginDto;

    const user = await this.userModel.findOne({ username });
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
        solanaWalletAddress: user.solanaWalletAddress,
        solanaWalletPrivateKey: user.solanaWalletPrivateKey,
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
