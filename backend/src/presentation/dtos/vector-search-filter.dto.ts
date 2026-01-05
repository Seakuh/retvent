import { IsOptional, IsString, IsNumber, Min, Max, IsArray, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class VectorSearchFilterDto {
  // Basis-Suche
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

  // Alters-Filter
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

  // Location-Filter
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistanceKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lon?: number;

  // Musik Filter
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

  @IsOptional()
  @IsString()
  categories?: string; // Komma-separierte Liste

  @IsOptional()
  @IsString()
  genres?: string; // Komma-separierte Liste

  @IsOptional()
  @IsString()
  tags?: string; // Komma-separierte Liste

  // Preis-Filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  @IsIn(['free', 'donation', 'paid', 'subscription'])
  pricingType?: 'free' | 'donation' | 'paid' | 'subscription';

  // Zeit-Filter
  @IsOptional()
  @IsString()
  dateFrom?: string; // ISO date string

  @IsOptional()
  @IsString()
  dateTo?: string; // ISO date string

  @IsOptional()
  @IsString()
  timeFrom?: string; // HH:MM

  @IsOptional()
  @IsString()
  timeTo?: string; // HH:MM

  @IsOptional()
  @IsString()
  weekdays?: string; // Komma-separiert: 'mon,tue,wed'

  // No-Go Filter (ausschließen)
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  avoidLoud?: string; // zu laut

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  avoidAlcohol?: string; // Alkohol-lastig

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  avoidCrowds?: string; // Menschenmengen

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  avoidPolitical?: string; // politisch / religiös

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  avoidLongDuration?: string; // lange Dauer

  @IsOptional()
  @IsString()
  avoidTags?: string; // Komma-separierte Liste von Tags zum Ausschließen

  // Loudness & Crowd Level
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxLoudnessLevel?: number; // 1-5

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxCrowdLevel?: number; // 1-5

  // Features
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  foodAvailable?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  veganAvailable?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  indoor?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  outdoor?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  online?: string;

  // Accessibility
  @IsOptional()
  @IsString()
  accessibility?: string; // Komma-separiert: 'wheelchair,hearing-loop'

  @IsOptional()
  @IsString()
  language?: string; // 'de', 'en', etc.

  // Vibe / Energy
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxEnergyLevel?: number; // 1-5

  @IsOptional()
  @IsString()
  vibeTags?: string; // Komma-separiert: 'relaxed,intimate,energetic'

  // Re-ranking / Boosting
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  boostToday?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false', '1', '0'])
  boostWeekend?: string;
}

