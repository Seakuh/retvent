import { Injectable } from '@nestjs/common';
import { Event } from '../../core/domain/event';
import { CreateEventDto } from '../../presentation/dtos/create-event.dto';

@Injectable()
export class EventMapper {
  toEntity(dto: CreateEventDto, hostId?: string): Partial<Event> {
    // Parse startDate - handle both ISO strings and date-only strings
    let startDateValue: Date;
    if (dto.startDate.includes('T')) {
      // ISO string with time (e.g., "2025-12-10T00:00:00.000Z")
      // Extract just the date part and combine with startTime
      const dateOnly = dto.startDate.split('T')[0];
      startDateValue = new Date(`${dateOnly}T${dto.startTime}:00`);
    } else {
      // Date-only string (e.g., "2025-12-10")
      startDateValue = new Date(`${dto.startDate}T${dto.startTime}:00`);
    }

    // Parse endDate if provided
    let endDateValue: Date | undefined;
    if (dto.endDate && dto.endTime) {
      if (dto.endDate.includes('T')) {
        const dateOnly = dto.endDate.split('T')[0];
        endDateValue = new Date(`${dateOnly}T${dto.endTime}:00`);
      } else {
        endDateValue = new Date(`${dto.endDate}T${dto.endTime}:00`);
      }
    }

    const mappedEvent = {
      ...dto,
      startDate: startDateValue,
      endDate: endDateValue,
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
