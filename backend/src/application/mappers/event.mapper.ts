import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../../presentation/dtos/create-event.dto';
import { Event } from '../../core/domain/event';

@Injectable()
export class EventMapper {
  toEntity(dto: CreateEventDto, hostId?: string): Partial<Event> {
    return {
      ...dto,
      startDate: new Date(`${dto.startDate}T${dto.startTime}:00`),
      hostId: hostId,
      socialMediaLinks: this.parseJsonField<Event['socialMediaLinks']>(dto.socialMediaLinks),
      tags: this.parseJsonField<string[]>(dto.tags),
      price: dto.price ? Number(dto.price) : undefined,
      lineup: this.parseJsonField<Event['lineup']>(dto.lineup),
      website: dto.website,
      ticketLink: dto.ticketLink,
      
    };
  }

  private parseJsonField<T>(field: string | T): T | undefined {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field) as T;
      } catch {
        return undefined;
      }
    }
    return field as T;
  }
} 