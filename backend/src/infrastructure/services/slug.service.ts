import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../../core/domain/event';

@Injectable()
export class SlugService {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<any>,
  ) {}

  /**
   * Generiert einen URL-freundlichen Slug für Events
   * Format: {title-slug}-{city-slug}-{year}
   * Beispiel: "techno-party-berlin-2024"
   */
  generateEventSlug(title: string, city: string, date: Date | string): string {
    // Titel zu Slug konvertieren
    const titleSlug = this.stringToSlug(title);

    // Stadt zu Slug konvertieren
    const citySlug = this.stringToSlug(city);

    // Jahr extrahieren
    const year = new Date(date).getFullYear();

    return `${titleSlug}-${citySlug}-${year}`;
  }

  /**
   * Konvertiert einen String zu einem URL-freundlichen Slug
   */
  stringToSlug(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Umlaute entfernen
      .replace(/[^a-z0-9]+/g, '-') // Sonderzeichen zu Bindestrich
      .replace(/(^-|-$)/g, ''); // Führende/abschließende Bindestriche entfernen
  }

  /**
   * Prüft ob Slug bereits existiert und fügt Nummer hinzu falls nötig
   */
  async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: any = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await this.eventModel.findOne(query);

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Generiert Slugs für ein Event (slug, citySlug, categorySlug)
   */
  async generateSlugsForEvent(
    eventData: {
      title?: string;
      city?: string;
      startDate?: Date | string;
      category?: string;
      slug?: string;
      citySlug?: string;
      categorySlug?: string;
    },
    excludeId?: string,
  ): Promise<{
    slug?: string;
    citySlug?: string;
    categorySlug?: string;
  }> {
    const slugs: {
      slug?: string;
      citySlug?: string;
      categorySlug?: string;
    } = {};

    // Event-Slug generieren
    if (
      eventData.title &&
      eventData.city &&
      eventData.startDate &&
      !eventData.slug
    ) {
      const baseSlug = this.generateEventSlug(
        eventData.title,
        eventData.city,
        eventData.startDate,
      );
      slugs.slug = await this.ensureUniqueSlug(baseSlug, excludeId);
    }

    // City-Slug generieren
    if (eventData.city && !eventData.citySlug) {
      slugs.citySlug = this.stringToSlug(eventData.city);
    }

    // Category-Slug generieren
    if (eventData.category && !eventData.categorySlug) {
      slugs.categorySlug = this.stringToSlug(eventData.category);
    }

    return slugs;
  }
}
