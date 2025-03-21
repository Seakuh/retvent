import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text: string;

  @IsMongoId()
  @IsOptional()
  parentId?: string;
}
