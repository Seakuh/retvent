import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { SolanaService } from './solana.service';
import {
  PurchaseTicketDto,
  TransferTicketDto,
  ValidateTicketDto,
} from '../dtos/solana.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('solana')
@UseGuards(JwtAuthGuard)
export class SolanaController {
  private readonly logger = new Logger(SolanaController.name);

  constructor(private readonly solanaService: SolanaService) {}

  @Post('purchase-ticket')
  async purchaseTicket(@Body() request: PurchaseTicketDto, @User() user: any) {
    this.logger.log(
      `User ${user.id} purchasing ${request.quantity} tickets for event ${request.eventId}`,
    );

    const result = await this.solanaService.purchaseTicket({
      ...request,
      userId: user.id,
    });

    return {
      success: true,
      data: result,
      message: 'Tickets purchased successfully',
    };
  }

  @Post('transfer-ticket')
  async transferTicket(@Body() request: TransferTicketDto, @User() user: any) {
    this.logger.log(
      `User ${user.id} transferring ticket ${request.ticketNftMint} to ${request.toUserId}`,
    );

    const result = await this.solanaService.transferTicket({
      ...request,
      fromUserId: user.id,
    });

    return {
      success: true,
      data: result,
      message: 'Ticket transferred successfully',
    };
  }

  @Post('validate-ticket')
  async validateTicket(@Body() request: ValidateTicketDto) {
    this.logger.log(
      `Validating ticket ${request.ticketNftMint} for event ${request.eventId}`,
    );

    const result = await this.solanaService.validateTicket(request);

    return {
      success: true,
      data: result,
      message: result.valid ? 'Ticket is valid' : 'Ticket is invalid',
    };
  }

  @Post('create-wallet')
  async createWallet(@User() user: any) {
    this.logger.log(`Creating wallet for user ${user.id}`);

    const result = await this.solanaService.createUserWallet(user.id);

    return {
      success: true,
      data: result,
      message: result.created
        ? 'Wallet created successfully'
        : 'Wallet already exists',
    };
  }

  @Get('wallet/balance')
  async getWalletBalance(@User() user: any) {
    const result = await this.solanaService.getUserWalletBalance(user.id);

    return {
      success: true,
      data: result,
      message: 'Wallet balance retrieved successfully',
    };
  }

  @Get('tickets')
  async getUserTickets(@User() user: any) {
    const result = await this.solanaService.getTicketsByUser(user.id);

    return {
      success: true,
      data: result,
      message: 'User tickets retrieved successfully',
    };
  }

  @Get('ticket/:mintAddress/metadata')
  async getTicketMetadata(@Param('mintAddress') mintAddress: string) {
    // This endpoint would return metadata for a specific ticket NFT
    // Used by the URI in the NFT metadata
    return {
      name: `Event Ticket`,
      description: `Blockchain-verified event ticket`,
      image: `https://api.retvent.com/ticket-image/${mintAddress}`,
      attributes: [
        {
          trait_type: 'Event',
          value: 'Event Name',
        },
        {
          trait_type: 'Date',
          value: new Date().toISOString(),
        },
        {
          trait_type: 'Verified',
          value: 'Yes',
        },
      ],
    };
  }
}
