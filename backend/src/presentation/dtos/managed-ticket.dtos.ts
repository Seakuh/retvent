import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '../../core/domain/managed-ticket';

export class TicketItemDto {
  @IsString()
  ticketType: string;

  @IsString()
  @IsOptional()
  ticketTypeName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsEmail()
  holderEmail: string;

  @IsString()
  @IsOptional()
  holderName?: string;

  @IsString()
  @IsOptional()
  holderPhone?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxCheckIns?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class IssueTicketsDto {
  @IsString()
  eventId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketItemDto)
  tickets: TicketItemDto[];

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;
}

export class ValidateTicketDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}

export class RedeemTicketDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}

export class CancelTicketDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class TransferTicketDto {
  @IsEmail()
  newEmail: string;

  @IsString()
  @IsOptional()
  newUserId?: string;
}

export class GetEventTicketsQueryDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
