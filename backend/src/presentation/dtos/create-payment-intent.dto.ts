import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}
