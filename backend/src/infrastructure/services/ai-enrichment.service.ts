import { Injectable } from '@nestjs/common';

@Injectable()
export class AiEnrichmentService {
  /**
   * Bereichert ein Event mit semantischen Feldern basierend auf Regeln
   */
  enrichEvent(eventData: {
    title?: string;
    description?: string;
    category?: string;
    city?: string;
  }): {
    eventType?: string;
    genre?: string[];
    mood?: string[];
    shortDescription?: string;
    vibe?: {
      energy?: number;
      intimacy?: number;
      exclusivity?: number;
      social?: number;
    };
    audience?: {
      ageRange?: [number, number];
      targetAudience?: string[];
    };
  } {
    const enriched: any = {};

    // Event-Typ aus Kategorie ableiten
    const categoryToType: Record<string, string> = {
      konzert: 'concert',
      concert: 'concert',
      festival: 'festival',
      club: 'club-night',
      theater: 'theater',
      sport: 'sports',
      sports: 'sports',
      workshop: 'workshop',
      networking: 'networking',
      ausstellung: 'exhibition',
      exhibition: 'exhibition',
      konferenz: 'conference',
      conference: 'conference',
      party: 'party',
      comedy: 'comedy',
    };

    if (eventData.category) {
      const categoryLower = eventData.category.toLowerCase();
      enriched.eventType =
        categoryToType[categoryLower] ||
        this.inferEventTypeFromText(
          `${eventData.title || ''} ${eventData.description || ''}`,
        );
    } else {
      enriched.eventType = this.inferEventTypeFromText(
        `${eventData.title || ''} ${eventData.description || ''}`,
      );
    }

    // Genre aus Beschreibung/Titel extrahieren
    const text = `${eventData.title || ''} ${eventData.description || ''}`.toLowerCase();
    enriched.genre = this.extractGenres(text);

    // Mood aus Text extrahieren
    enriched.mood = this.extractMoods(text);

    // Short Description generieren
    if (eventData.description) {
      enriched.shortDescription = this.generateShortDescription(
        eventData.description,
      );
    } else if (eventData.title) {
      enriched.shortDescription = eventData.title.substring(0, 160);
    }

    // Vibe schätzen basierend auf Genre und Event-Typ
    enriched.vibe = this.estimateVibe(enriched.eventType, enriched.genre);

    // Audience schätzen
    enriched.audience = this.estimateAudience(enriched.eventType, enriched.genre);

    return enriched;
  }

  private inferEventTypeFromText(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('festival')) return 'festival';
    if (lowerText.includes('club') || lowerText.includes('night')) return 'club-night';
    if (lowerText.includes('konzert') || lowerText.includes('concert')) return 'concert';
    if (lowerText.includes('theater') || lowerText.includes('theatre')) return 'theater';
    if (lowerText.includes('sport') || lowerText.includes('match')) return 'sports';
    if (lowerText.includes('workshop') || lowerText.includes('seminar')) return 'workshop';
    if (lowerText.includes('networking') || lowerText.includes('meetup')) return 'networking';
    if (lowerText.includes('ausstellung') || lowerText.includes('exhibition')) return 'exhibition';
    if (lowerText.includes('konferenz') || lowerText.includes('conference')) return 'conference';
    if (lowerText.includes('comedy') || lowerText.includes('stand-up')) return 'comedy';
    if (lowerText.includes('party')) return 'party';

    return 'other';
  }

  private extractGenres(text: string): string[] {
    const genres: string[] = [];
    const genreKeywords: Record<string, string[]> = {
      techno: ['techno', 'tech house', 'minimal'],
      house: ['house', 'deep house', 'tech house'],
      'hip-hop': ['hip-hop', 'hiphop', 'rap', 'trap'],
      rock: ['rock', 'indie rock', 'alternative rock'],
      pop: ['pop', 'pop music'],
      jazz: ['jazz', 'smooth jazz'],
      electronic: ['electronic', 'edm', 'dubstep', 'trance'],
      classical: ['classical', 'symphony', 'orchestra'],
      reggae: ['reggae', 'dancehall'],
      latin: ['latin', 'salsa', 'bachata'],
    };

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        genres.push(genre);
      }
    }

    return genres;
  }

  private extractMoods(text: string): string[] {
    const moods: string[] = [];
    const moodKeywords: Record<string, string[]> = {
      energetic: ['energetic', 'energie', 'high energy', 'intense'],
      chill: ['chill', 'relaxed', 'laid back', 'easy'],
      romantic: ['romantic', 'romantisch', 'intimate'],
      party: ['party', 'feiern', 'celebration'],
      professional: ['professional', 'business', 'networking'],
      artistic: ['artistic', 'creative', 'art', 'kunst'],
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        moods.push(mood);
      }
    }

    return moods;
  }

  private generateShortDescription(description: string): string {
    const maxLength = 160;
    if (description.length <= maxLength) {
      return description;
    }

    // Versuche bei Satzende abzuschneiden
    const truncated = description.substring(0, maxLength - 3);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

    if (lastSentenceEnd > maxLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }

    return truncated.trim() + '...';
  }

  private estimateVibe(
    eventType?: string,
    genres?: string[],
  ): {
    energy: number;
    intimacy: number;
    exclusivity: number;
    social: number;
  } {
    let energy = 50;
    let intimacy = 50;
    let exclusivity = 30;
    let social = 70;

    // Event-Typ basierte Schätzungen
    switch (eventType) {
      case 'festival':
        energy = 90;
        intimacy = 20;
        exclusivity = 20;
        social = 95;
        break;
      case 'club-night':
        energy = 85;
        intimacy = 40;
        exclusivity = 40;
        social = 90;
        break;
      case 'concert':
        energy = 80;
        intimacy = 30;
        exclusivity = 30;
        social = 85;
        break;
      case 'theater':
        energy = 40;
        intimacy = 60;
        exclusivity = 50;
        social = 50;
        break;
      case 'workshop':
        energy = 50;
        intimacy = 70;
        exclusivity = 20;
        social = 75;
        break;
      case 'networking':
        energy = 40;
        intimacy = 60;
        exclusivity = 30;
        social = 90;
        break;
    }

    // Genre-basierte Anpassungen
    if (genres?.includes('techno') || genres?.includes('house')) {
      energy = Math.min(95, energy + 10);
      social = Math.min(95, social + 5);
    }

    if (genres?.includes('jazz') || genres?.includes('classical')) {
      energy = Math.max(30, energy - 20);
      intimacy = Math.min(80, intimacy + 20);
    }

    return { energy, intimacy, exclusivity, social };
  }

  private estimateAudience(
    eventType?: string,
    genres?: string[],
  ): {
    ageRange: [number, number];
    targetAudience: string[];
  } {
    let ageRange: [number, number] = [18, 65];
    const targetAudience: string[] = [];

    switch (eventType) {
      case 'festival':
      case 'club-night':
        ageRange = [18, 35];
        targetAudience.push('students', 'young professionals');
        break;
      case 'theater':
        ageRange = [25, 70];
        targetAudience.push('professionals', 'culture enthusiasts');
        break;
      case 'workshop':
      case 'conference':
        ageRange = [25, 55];
        targetAudience.push('professionals');
        break;
      case 'networking':
        ageRange = [25, 50];
        targetAudience.push('professionals', 'entrepreneurs');
        break;
    }

    if (genres?.includes('techno') || genres?.includes('house')) {
      ageRange = [18, 35];
      targetAudience.push('students', 'party-goers');
    }

    return { ageRange, targetAudience };
  }
}
