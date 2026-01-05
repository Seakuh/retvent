import { IsOptional, IsString, IsNumber, Min, Max, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class VectorSearchFilterDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  isUpcoming?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  // Musik Filter - als komma-separierte Liste oder einzelne Werte
  // z.B. musikTypes=live,DJ oder musikTypes=live
  @IsOptional()
  @IsString()
  musikTypes?: string; // 'live', 'DJ', 'Genre' oder komma-separiert

  @IsOptional()
  @IsString()
  musikGenre?: string;

  // Kategorien
  @IsOptional()
  @IsString()
  @IsIn(['Kunst / Kultur', 'Networking / Business', 'Lernen / Talks', 'Party / Nachtleben', 'Natur / Outdoor', 'Experimentell / ungewöhnlich'])
  category?: 'Kunst / Kultur' | 'Networking / Business' | 'Lernen / Talks' | 'Party / Nachtleben' | 'Natur / Outdoor' | 'Experimentell / ungewöhnlich';
}

