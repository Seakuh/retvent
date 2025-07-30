// sponsoring.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsoringController } from './sponsoring.controller';
import { SponsoringService } from './sponsoring.service';
import { SolanaService } from './solana.service';
import { Sponsor } from './entities/sponsor.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Sponsor])
  ],
  controllers: [SponsoringController],
  providers: [SponsoringService, SolanaService],
  exports: [SponsoringService]
})
export class SponsoringModule {}

// entities/sponsor.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

@Entity('sponsors')
@Index(['eventId', 'createdAt'])
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  eventId: number;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userAvatar?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amountEUR: number;

  @Column('decimal', { precision: 10, scale: 4 })
  amountSOL: number;

  @Column({ type: 'enum', enum: BadgeTier })
  badgeTier: BadgeTier;

  @Column()
  transactionSignature: string;

  @Column()
  sponsorWalletAddress: string;

  @Column({ nullable: true })
  badgeNftAddress?: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// dto/create-sponsor.dto.ts
import { IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSponsorDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsNumber()
  @Min(10)
  amountEUR: number;

  @ApiProperty()
  @IsString()
  paymentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userAvatar?: string;
}

// sponsoring.controller.ts
import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SponsoringService } from './sponsoring.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';

@ApiTags('sponsoring')
@Controller('sponsoring')
export class SponsoringController {
  constructor(private readonly sponsoringService: SponsoringService) {}

  @Post('process-payment')
  @ApiOperation({ summary: 'Process sponsor payment from payment provider' })
  @ApiResponse({ status: 201, description: 'Sponsorship processed successfully' })
  async processSponsorPayment(@Body() createSponsorDto: CreateSponsorDto) {
    try {
      const result = await this.sponsoringService.processSponsorPayment(createSponsorDto);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to process sponsorship: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get sponsors for specific event' })
  async getEventSponsors(
    @Param('eventId') eventId: number,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ) {
    return this.sponsoringService.getEventSponsors(eventId, limit, offset);
  }

  @Get('event/:eventId/stats')
  @ApiOperation({ summary: 'Get sponsorship statistics for event' })
  async getEventStats(@Param('eventId') eventId: number) {
    return this.sponsoringService.getEventSponsorStats(eventId);
  }

  @Get('verify/:signature')
  @ApiOperation({ summary: 'Verify sponsorship on blockchain' })
  async verifySponsorshipOnChain(@Param('signature') signature: string) {
    return this.sponsoringService.verifySponsorshipOnChain(signature);
  }

  @Get('user/:userId/badges')
  @ApiOperation({ summary: 'Get all badges for a user' })
  async getUserBadges(@Param('userId') userId: number) {
    return this.sponsoringService.getUserBadges(userId);
  }
}

// sponsoring.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor, BadgeTier } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { SolanaService } from './solana.service';
import { createHash } from 'crypto';

@Injectable()
export class SponsoringService {
  private readonly logger = new Logger(SponsoringService.name);

  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
    private solanaService: SolanaService
  ) {}

  async processSponsorPayment(dto: CreateSponsorDto) {
    this.logger.log(`Processing sponsor payment for event ${dto.eventId}`);

    try {
      // 1. Convert EUR to SOL
      const amountSOL = await this.convertEURtoSOL(dto.amountEUR);

      // 2. Generate sponsor wallet
      const sponsorWallet = await this.generateSponsorWallet(dto.userId, dto.paymentId);

      // 3. Create blockchain transaction
      const transactionSignature = await this.solanaService.createSponsorshipTransaction(
        sponsorWallet.publicKey.toString(),
        amountSOL,
        {
          userId: dto.userId,
          eventId: dto.eventId,
          amountEUR: dto.amountEUR,
          userName: dto.userName
        }
      );

      // 4. Determine badge tier
      const badgeTier = this.getBadgeTier(dto.amountEUR);

      // 5. Mint NFT Badge
      const badgeNft = await this.solanaService.mintSponsorBadge(
        sponsorWallet.publicKey.toString(),
        dto.amountEUR,
        dto.eventId,
        dto.userName,
        badgeTier
      );

      // 6. Save to database
      const sponsor = this.sponsorRepository.create({
        ...dto,
        amountSOL,
        badgeTier,
        transactionSignature,
        sponsorWalletAddress: sponsorWallet.publicKey.toString(),
        badgeNftAddress: badgeNft.address,
        verified: true
      });

      const savedSponsor = await this.sponsorRepository.save(sponsor);

      // 7. Emit event for real-time updates
      // this.eventEmitter.emit('sponsor.created', savedSponsor);

      return {
        id: savedSponsor.id,
        transactionUrl: `https://solscan.io/tx/${transactionSignature}?cluster=devnet`,
        badgeUrl: `https://solscan.io/token/${badgeNft.address}?cluster=devnet`,
        badgeTier,
        sponsor: savedSponsor
      };
    } catch (error) {
      this.logger.error(`Failed to process sponsorship: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEventSponsors(eventId: number, limit: number = 20, offset: number = 0) {
    const [sponsors, total] = await this.sponsorRepository.findAndCount({
      where: { eventId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    return {
      sponsors,
      total,
      limit,
      offset
    };
  }

  async getEventSponsorStats(eventId: number) {
    const sponsors = await this.sponsorRepository.find({ where: { eventId } });

    const stats = {
      totalSponsors: sponsors.length,
      totalAmountEUR: sponsors.reduce((sum, s) => sum + Number(s.amountEUR), 0),
      totalAmountSOL: sponsors.reduce((sum, s) => sum + Number(s.amountSOL), 0),
      tierDistribution: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0
      },
      recentSponsors: sponsors.slice(0, 5)
    };

    sponsors.forEach(sponsor => {
      stats.tierDistribution[sponsor.badgeTier]++;
    });

    return stats;
  }

  async getUserBadges(userId: number) {
    const sponsors = await this.sponsorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    return sponsors.map(sponsor => ({
      eventId: sponsor.eventId,
      badgeTier: sponsor.badgeTier,
      amountEUR: sponsor.amountEUR,
      date: sponsor.createdAt,
      nftAddress: sponsor.badgeNftAddress,
      verified: sponsor.verified
    }));
  }

  async verifySponsorshipOnChain(signature: string) {
    return this.solanaService.verifyTransaction(signature);
  }

  private getBadgeTier(amountEUR: number): BadgeTier {
    if (amountEUR >= 1000) return BadgeTier.PLATINUM;
    if (amountEUR >= 200) return BadgeTier.GOLD;
    if (amountEUR >= 50) return BadgeTier.SILVER;
    return BadgeTier.BRONZE;
  }

  private async convertEURtoSOL(amountEUR: number): Promise<number> {
    // TODO: Implement real exchange rate API
    // For now using mock rate
    const mockRate = 0.02; // 1 SOL = 50 EUR
    return amountEUR * mockRate;
  }

  private async generateSponsorWallet(userId: number, paymentId: string) {
    return this.solanaService.generateDeterministicWallet(userId, paymentId);
  }
}

// solana.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { createHash } from 'crypto';
import * as bs58 from 'bs58';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private serviceWallet: Keypair;
  private metaplex: Metaplex;

  constructor(private configService: ConfigService) {
    // Initialize Solana connection
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL', 'https://api.devnet.solana.com');
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Initialize service wallet
    const privateKey = this.configService.get<string>('SERVICE_WALLET_PRIVATE_KEY');
    this.serviceWallet = Keypair.fromSecretKey(bs58.decode(privateKey));

    // Initialize Metaplex
    this.metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(this.serviceWallet))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: rpcUrl,
        timeout: 60000,
      }));

    this.logger.log(`Solana service initialized on ${rpcUrl}`);
  }

  async createSponsorshipTransaction(
    sponsorWalletAddress: string,
    amountSOL: number,
    metadata: any
  ): Promise<string> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.serviceWallet.publicKey,
          toPubkey: new PublicKey(sponsorWalletAddress),
          lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
        })
      );

      // Add memo with metadata
      // You can add a Memo program instruction here if needed

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.serviceWallet]
      );

      this.logger.log(`Transaction sent: ${signature}`);
      return signature;
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`);
      throw error;
    }
  }

  async mintSponsorBadge(
    sponsorWalletAddress: string,
    amountEUR: number,
    eventId: number,
    userName: string,
    tier: string
  ) {
    try {
      // Upload metadata
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: `${tier.toUpperCase()} Sponsor - Event ${eventId}`,
        symbol: 'SPONSOR',
        description: `${userName} is a ${tier} sponsor for Event ${eventId}`,
        image: this.getBadgeImageUrl(tier),
        attributes: [
          { trait_type: 'Tier', value: tier },
          { trait_type: 'Amount EUR', value: amountEUR.toString() },
          { trait_type: 'Event ID', value: eventId.toString() },
          { trait_type: 'Sponsor Name', value: userName }
        ]
      });

      // Mint NFT
      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: `${tier.toUpperCase()} Sponsor Badge`,
        sellerFeeBasisPoints: 0,
        tokenOwner: new PublicKey(sponsorWalletAddress),
        symbol: 'SPONSOR',
        creators: [{
          address: this.serviceWallet.publicKey,
          share: 100
        }],
        isMutable: false,
        maxSupply: 1
      });

      this.logger.log(`NFT minted: ${nft.address.toString()}`);
      return { address: nft.address.toString() };
    } catch (error) {
      this.logger.error(`NFT minting failed: ${error.message}`);
      throw error;
    }