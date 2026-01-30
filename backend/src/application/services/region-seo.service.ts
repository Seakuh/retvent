import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IRegionRepository } from '../../core/repositories/region.repository.interface';
import { Region } from '../../core/domain/region';
import { IEventRepository } from '../../core/repositories/event.repository.interface';

export interface SEOContent {
  slug: string;
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  introText: string;
  faq: Array<{ question: string; answer: string }>;
  internalLinks: Array<{ text: string; url: string }>;
  schemaEventTemplate: {
    name: string;
    startDate: string;
    endDate: string;
    eventStatus: string;
    eventAttendanceMode: string;
    location: {
      name: string;
      address: {
        streetAddress: string;
        addressLocality: string;
        postalCode: string;
        addressRegion: string;
        addressCountry: string;
      };
    };
    image: string;
    description: string;
    organizer: {
      name: string;
      url: string;
    };
    offers: {
      price: string;
      currency: string;
      url: string;
      availability: string;
      validFrom: string;
    };
  };
}

@Injectable()
export class RegionSeoService {
  constructor(
    @Inject('IRegionRepository')
    private readonly regionRepository: IRegionRepository,
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
  ) {}

  async generateSeoContent(
    regionId: string,
    options?: {
      regionPlaces?: string[];
      topEventCategories?: string[];
      nearbyRegions?: string[];
    },
  ): Promise<SEOContent> {
    const region = await this.regionRepository.findById(regionId);
    if (!region) {
      throw new NotFoundException(`Region with ID ${regionId} not found`);
    }

    // Hole Events in der Region für Kategorien-Analyse
    const events = await this.regionRepository.findEventsInRegion(regionId);
    const categories = this.extractTopCategories(events, options?.topEventCategories);

    // Generiere SEO-Inhalte
    const slug = region.slug || this.slugify(region.name);
    const url = `/events/${slug}`;
    const title = `Events im ${region.name}${region.parentRegion ? ` (${region.parentRegion})` : ''} | Event-Plattform`;
    const metaDescription = this.generateMetaDescription(region, categories);
    const h1 = `Events im ${region.name}`;
    const introText = this.generateIntroText(region, options?.regionPlaces || [], categories);
    const faq = this.generateFaq(region, categories);
    const internalLinks = this.generateInternalLinks(region, options?.nearbyRegions || [], categories);
    const schemaEventTemplate = this.generateSchemaTemplate(region);

    return {
      slug,
      url,
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      metaDescription: metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription,
      h1,
      introText,
      faq,
      internalLinks,
      schemaEventTemplate,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private extractTopCategories(
    events: any[],
    providedCategories?: string[],
  ): string[] {
    if (providedCategories && providedCategories.length > 0) {
      return providedCategories.slice(0, 3);
    }

    const categoryCounts: Record<string, number> = {};
    events.forEach((event) => {
      if (event.category) {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private generateMetaDescription(region: Region, categories: string[]): string {
    const categoryText = categories.length > 0
      ? ` von ${categories.slice(0, 2).join(' und ')}`
      : '';
    return `Entdecke die besten Events im ${region.name}${categoryText}. Finde Konzerte, Festivals, Partys und mehr. Tickets jetzt buchen!`;
  }

  private generateIntroText(
    region: Region,
    places: string[],
    categories: string[],
  ): string {
    const season = this.getCurrentSeason();
    let text = `Der ${region.name} ist eine lebendige Region mit einem vielfältigen Event-Angebot. `;

    if (places.length > 0) {
      const mentionedPlaces = places.slice(0, Math.min(6, places.length));
      text += `Besonders beliebte Orte wie ${mentionedPlaces.join(', ')} bieten regelmäßig spannende Veranstaltungen. `;
    }

    if (categories.length > 0) {
      const categoryText = categories.slice(0, 3).join(', ');
      text += `Von ${categoryText} ist für jeden Geschmack etwas dabei. `;
    }

    text += `${season} ist die perfekte Zeit, um die Region zu erkunden und neue Events zu entdecken. `;
    text += `Durchstöbere unseren Event-Kalender und finde die passenden Veranstaltungen für dich. `;
    text += `Tickets können direkt online gebucht werden.`;

    return text;
  }

  private generateFaq(region: Region, categories: string[]): Array<{ question: string; answer: string }> {
    const currentYear = new Date().getFullYear();
    const faqs: Array<{ question: string; answer: string }> = [];

    // Zeitbezogene Frage 1
    faqs.push({
      question: `Welche Events finden heute im ${region.name} statt?`,
      answer: `Auf unserer Plattform findest du alle Events, die heute im ${region.name} stattfinden. Filtere einfach nach dem heutigen Datum, um aktuelle Veranstaltungen zu sehen.`,
    });

    // Zeitbezogene Frage 2
    faqs.push({
      question: `Was gibt es am Wochenende im ${region.name} zu erleben?`,
      answer: `Am Wochenende bietet der ${region.name} eine große Auswahl an Events. Von Konzerten über Festivals bis hin zu kulturellen Veranstaltungen - schaue einfach in unseren Wochenend-Kalender.`,
    });

    // Familienfreundlich/Kostenlos
    faqs.push({
      question: `Gibt es kostenlose oder familienfreundliche Events im ${region.name}?`,
      answer: `Ja, es gibt regelmäßig kostenlose und familienfreundliche Veranstaltungen im ${region.name}. Nutze unsere Filterfunktion, um nach kostenlosen Events oder familienfreundlichen Aktivitäten zu suchen.`,
    });

    // Anreise/Locations
    faqs.push({
      question: `Wie komme ich zu den Event-Locations im ${region.name}?`,
      answer: `Die meisten Events im ${region.name} sind gut mit öffentlichen Verkehrsmitteln erreichbar. In den Event-Details findest du genaue Anfahrtsbeschreibungen und Adressen der Veranstaltungsorte.`,
    });

    return faqs;
  }

  private generateInternalLinks(
    region: Region,
    nearbyRegions: string[],
    categories: string[],
  ): Array<{ text: string; url: string }> {
    const links: Array<{ text: string; url: string }> = [];

    // Nachbarregionen
    if (nearbyRegions.length > 0) {
      const regionsToLink = nearbyRegions.slice(0, 3);
      for (const nearbyRegion of regionsToLink) {
        const slug = this.slugify(nearbyRegion);
        links.push({
          text: `Events im ${nearbyRegion}`,
          url: `/events/${slug}`,
        });
      }
    }

    // Kategorien-Unterseiten
    if (categories.length > 0) {
      const categoriesToLink = categories.slice(0, 3);
      const regionSlug = region.slug || this.slugify(region.name);
      for (const category of categoriesToLink) {
        const categorySlug = this.slugify(category);
        links.push({
          text: `${category} im ${region.name}`,
          url: `/events/${regionSlug}/${categorySlug}`,
        });
      }
    }

    // Stelle sicher, dass wir mindestens 6 Links haben
    while (links.length < 6) {
      links.push({
        text: `Weitere Events im ${region.name}`,
        url: `/events/${region.slug || this.slugify(region.name)}`,
      });
    }

    return links.slice(0, 6);
  }

  private generateSchemaTemplate(region: Region): SEOContent['schemaEventTemplate'] {
    return {
      name: 'Event Name',
      startDate: '2026-01-01T18:00:00+01:00',
      endDate: '2026-01-01T23:00:00+01:00',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        name: region.name,
        address: {
          streetAddress: region.address || '',
          addressLocality: region.name,
          postalCode: '',
          addressRegion: region.parentRegion || '',
          addressCountry: region.country || 'Deutschland',
        },
      },
      image: region.logoUrl || '',
      description: region.description,
      organizer: {
        name: 'Event Organizer',
        url: 'https://example.com',
      },
      offers: {
        price: '0',
        currency: 'EUR',
        url: 'https://example.com/tickets',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01T00:00:00+01:00',
      },
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Der Frühling';
    if (month >= 6 && month <= 8) return 'Der Sommer';
    if (month >= 9 && month <= 11) return 'Der Herbst';
    return 'Der Winter';
  }
}
