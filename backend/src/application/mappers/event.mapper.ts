import { Injectable } from '@nestjs/common';
import { Event } from '../../core/domain/event';
import { CreateEventDto } from '../../presentation/dtos/create-event.dto';

@Injectable()
export class EventMapper {
  toEntity(dto: CreateEventDto, hostId?: string): Partial<Event> {
    const mappedEvent = {
      ...dto,
      startDate: new Date(`${dto.startDate}T${dto.startTime}:00`),
      hostId: hostId,
      socialMediaLinks: this.parseJsonField<Event['socialMediaLinks']>(
        dto.socialMediaLinks,
      ),
      tags: this.parseJsonField<string[]>(dto.tags),
      price: dto.price ? dto.price : undefined,
      lineup: this.parseJsonField<Event['lineup']>(dto.lineup),
      website: dto.website,
      ticketLink: dto.ticketLink,
      createdAt: new Date(),
      updatedAt: new Date(),
      city: dto.city,
      location: dto.city
        ? {
            city: dto.city,
            address: dto.location?.address,
            coordinates: dto.location?.coordinates,
          }
        : undefined,
    };

    return Object.fromEntries(
      Object.entries(mappedEvent).filter(([_, v]) => v !== undefined),
    );
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
