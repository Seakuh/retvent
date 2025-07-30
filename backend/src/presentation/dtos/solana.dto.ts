import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class PurchaseTicketDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  pricePerTicket: number;
}

export class TransferTicketDto {
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsString()
  @IsNotEmpty()
  ticketNftMint: string;
}

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketNftMint: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}
