import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  opponentId: string;

  @IsString()
  @IsNotEmpty()
  opponentName: string;
}

export class PlayerActionDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsEnum(['FOLD', 'CHECK', 'CALL', 'BET', 'RAISE', 'ALL_IN'])
  @IsNotEmpty()
  action: 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALL_IN';

  @IsNumber()
  @IsOptional()
  amount?: number;
}

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;
}

export class DeclineInvitationDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;
}
