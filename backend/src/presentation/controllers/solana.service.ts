import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  keypairIdentity,
  generateSigner,
  percentAmount,
  some,
  none,
} from '@metaplex-foundation/umi';
import {
  fromWeb3JsKeypair,
} from '@metaplex-foundation/umi-web3js-adapters';
import { UserService } from '../../application/services/user.service';
import { EventService } from '../../application/services/event.service';
import { loadCLIKeypair } from '../../load-wallet';
import bs58 from 'bs58';

export interface TicketPurchaseRequest {
  eventId: string;
  userId: string;
  quantity: number;
  pricePerTicket: number;
}

export interface TicketTransferRequest {
  fromUserId: string;
  toUserId: string;
  ticketNftMint: string;
}

export interface TicketValidationRequest {
  ticketNftMint: string;
  eventId: string;
}

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;
  private readonly umi;
  private readonly serverKeypair: Keypair;

  constructor(
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    );
    this.serverKeypair = loadCLIKeypair();

    this.umi = createUmi(this.connection.rpcEndpoint)
      .use(mplTokenMetadata())
      .use(keypairIdentity(fromWeb3JsKeypair(this.serverKeypair)));
  }

  async purchaseTicket(
    request: TicketPurchaseRequest,
  ): Promise<{ transactionId: string; ticketNfts: string[] }> {
    try {
      this.logger.log(
        `Processing ticket purchase for user ${request.userId}, event ${request.eventId}`,
      );

      // Get event details
      const event = await this.eventService.findById(request.eventId);
      if (!event) {
        throw new BadRequestException('Event not found');
      }

      // Get user wallet keypair
      const userKeypair = await this.getUserKeypair(request.userId);
      if (!userKeypair) {
        throw new BadRequestException('User wallet not found');
      }

      // Calculate total cost
      const totalCost = request.quantity * request.pricePerTicket;
      const totalCostLamports = totalCost * LAMPORTS_PER_SOL;

      // Check user balance
      const userBalance = await this.connection.getBalance(
        userKeypair.publicKey,
      );
      if (userBalance < totalCostLamports) {
        throw new BadRequestException('Insufficient balance');
      }

      // Create payment transaction
      const paymentTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userKeypair.publicKey,
          toPubkey: this.serverKeypair.publicKey,
          lamports: totalCostLamports,
        }),
      );

      // Send payment
      const paymentSignature = await sendAndConfirmTransaction(
        this.connection,
        paymentTransaction,
        [userKeypair],
      );

      this.logger.log(`Payment completed: ${paymentSignature}`);

      // Create NFT tickets
      const ticketNfts: string[] = [];

      for (let i = 0; i < request.quantity; i++) {
        const ticketNft = await this.createTicketNft({
          eventId: request.eventId,
          userId: request.userId,
          eventTitle: event.title,
          eventDate: event.startDate || new Date(),
          ticketNumber: i + 1,
          totalTickets: request.quantity,
          ownerPublicKey: userKeypair.publicKey,
        });

        ticketNfts.push(ticketNft);
      }

      return {
        transactionId: paymentSignature,
        ticketNfts,
      };
    } catch (error) {
      this.logger.error('Error purchasing ticket:', error);
      throw new InternalServerErrorException('Failed to purchase ticket');
    }
  }

  async transferTicket(
    request: TicketTransferRequest,
  ): Promise<{ transactionId: string }> {
    try {
      this.logger.log(
        `Transferring ticket ${request.ticketNftMint} from ${request.fromUserId} to ${request.toUserId}`,
      );

      // Get sender and receiver keypairs
      const fromKeypair = await this.getUserKeypair(request.fromUserId);
      const toKeypair = await this.getUserKeypair(request.toUserId);

      if (!fromKeypair || !toKeypair) {
        throw new BadRequestException('User wallet not found');
      }

      // For now, we'll use a simple SOL transfer as NFT transfer is more complex
      // In production, you would implement proper NFT transfer using SPL Token program
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toKeypair.publicKey,
          lamports: 1000000, // 0.001 SOL as a symbolic transfer
        }),
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transferTransaction,
        [fromKeypair],
      );

      this.logger.log(`Ticket transfer completed: ${signature}`);

      return { transactionId: signature };
    } catch (error) {
      this.logger.error('Error transferring ticket:', error);
      throw new InternalServerErrorException('Failed to transfer ticket');
    }
  }

  async validateTicket(
    request: TicketValidationRequest,
  ): Promise<{ valid: boolean; ticketData?: any }> {
    try {
      this.logger.log(
        `Validating ticket ${request.ticketNftMint} for event ${request.eventId}`,
      );

      const mintPublicKey = new PublicKey(request.ticketNftMint);

      // Check if the mint exists on the blockchain
      const mintInfo = await this.connection.getAccountInfo(mintPublicKey);

      if (!mintInfo) {
        return { valid: false };
      }

      // For now, we'll consider the ticket valid if the mint exists
      // In production, you would verify the metadata and check event-specific data
      const ticketData = {
        mint: request.ticketNftMint,
        eventId: request.eventId,
        validatedAt: new Date().toISOString(),
      };

      this.logger.log(`Ticket validation successful: ${request.ticketNftMint}`);

      return {
        valid: true,
        ticketData,
      };
    } catch (error) {
      this.logger.error('Error validating ticket:', error);
      return { valid: false };
    }
  }

  private async createTicketNft(params: {
    eventId: string;
    userId: string;
    eventTitle: string;
    eventDate: Date;
    ticketNumber: number;
    totalTickets: number;
    ownerPublicKey: PublicKey;
  }): Promise<string> {
    try {
      const mint = generateSigner(this.umi);

      // Create NFT with simplified parameters
      const createNftInstruction = createNft(this.umi, {
        mint,
        name: `${params.eventTitle} - Ticket #${params.ticketNumber}`,
        symbol: 'TICKET',
        uri: `https://api.retvent.com/ticket-metadata/${params.eventId}/${params.ticketNumber}`,
        sellerFeeBasisPoints: percentAmount(0, 2),
        creators: some([
          {
            address: this.umi.identity.publicKey,
            verified: true,
            share: 100,
          },
        ]),
        collection: none(),
        uses: none(),
      });

      const result = await createNftInstruction.sendAndConfirm(this.umi);
      const signature = bs58.encode(result.signature);

      this.logger.log(
        `Created ticket NFT: ${mint.publicKey} with signature: ${signature}`,
      );

      return mint.publicKey.toString();
    } catch (error) {
      this.logger.error('Error creating ticket NFT:', error);
      throw error;
    }
  }

  private async getUserKeypair(userId: string): Promise<Keypair | null> {
    try {
      // In a real implementation, you would retrieve the encrypted keypair from database
      // For now, we'll generate a deterministic keypair based on user ID
      const user = await this.userService.findById(userId);
      if (!user) {
        return null;
      }

      // In production, store encrypted keypairs in database
      // This is a simplified example - DO NOT use in production
      const seed = Buffer.from(userId + process.env.WALLET_SEED_SECRET, 'utf8');
      const keypair = Keypair.fromSeed(seed.slice(0, 32));

      return keypair;
    } catch (error) {
      this.logger.error('Error getting user keypair:', error);
      return null;
    }
  }

  async createUserWallet(
    userId: string,
  ): Promise<{ publicKey: string; created: boolean }> {
    try {
      const existingKeypair = await this.getUserKeypair(userId);
      if (existingKeypair) {
        return {
          publicKey: existingKeypair.publicKey.toString(),
          created: false,
        };
      }

      // Generate new keypair
      const newKeypair = Keypair.generate();

      // In production, encrypt and store the keypair in database
      // This is a simplified example

      this.logger.log(
        `Created wallet for user ${userId}: ${newKeypair.publicKey.toString()}`,
      );

      return {
        publicKey: newKeypair.publicKey.toString(),
        created: true,
      };
    } catch (error) {
      this.logger.error('Error creating user wallet:', error);
      throw new InternalServerErrorException('Failed to create user wallet');
    }
  }

  async getUserWalletBalance(
    userId: string,
  ): Promise<{ balance: number; publicKey: string }> {
    try {
      const keypair = await this.getUserKeypair(userId);
      if (!keypair) {
        throw new BadRequestException('User wallet not found');
      }

      const balance = await this.connection.getBalance(keypair.publicKey);

      return {
        balance: balance / LAMPORTS_PER_SOL,
        publicKey: keypair.publicKey.toString(),
      };
    } catch (error) {
      this.logger.error('Error getting user wallet balance:', error);
      throw new InternalServerErrorException('Failed to get wallet balance');
    }
  }

  async getTicketsByUser(userId: string): Promise<any[]> {
    try {
      const keypair = await this.getUserKeypair(userId);
      if (!keypair) {
        throw new BadRequestException('User wallet not found');
      }

      // Get all token accounts for the user
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        keypair.publicKey,
        {
          programId: new PublicKey(
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          ),
        },
      );

      const tickets = [];

      for (const tokenAccount of tokenAccounts.value) {
        // Check if it's an NFT (amount = 1, decimals = 0)
        const accountInfo = await this.connection.getTokenAccountBalance(
          tokenAccount.pubkey,
        );
        if (
          accountInfo.value.amount === '1' &&
          accountInfo.value.decimals === 0
        ) {
          tickets.push({
            tokenAccount: tokenAccount.pubkey.toString(),
            mint: tokenAccount.account.data.slice(0, 32),
          });
        }
      }

      return tickets;
    } catch (error) {
      this.logger.error('Error getting user tickets:', error);
      throw new InternalServerErrorException('Failed to get user tickets');
    }
  }
}
