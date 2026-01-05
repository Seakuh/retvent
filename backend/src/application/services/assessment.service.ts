import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssessmentDto } from 'src/presentation/dtos/create-assessment.dto';
import { IPeerAssessment } from 'src/core/domain/peer-assessment.schema';
import { ISelfAssessment } from 'src/core/domain/self-assessment.schema';
import { CreatePeerAssessmentDto } from 'src/presentation/dtos/create-peer-assessment.dto';
import { GroupService } from './group.service';
import { ProfileService } from './profile.service';
import {
  AssessmentMatrixDto,
  AssessmentDataPoint,
} from 'src/presentation/dtos/assessment-matrix.dto';
import { UserService } from './user.service';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { QdrantService } from 'src/infrastructure/services/qdrant.service';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { OnboardingPreferencesDto } from 'src/presentation/dtos/onboarding-preferences.dto';
import { Event } from 'src/core/domain/event';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly groupService: GroupService,
    private readonly profileService: ProfileService,
    @InjectModel('PeerAssessment')
    private readonly peerAssessmentModel: Model<IPeerAssessment>,
    @InjectModel('SelfAssessment')
    private readonly selfAssessmentModel: Model<ISelfAssessment>,
    private readonly userService: UserService,
    private readonly chatGptService: ChatGPTService,
    private readonly qdrantService: QdrantService,
    private readonly eventRepository: MongoEventRepository,
  ) {}

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ) {
    // Überprüfe ob bereits eine Selbsteinschätzung existiert
    const existingAssessment = await this.selfAssessmentModel.findOne({
      userId,
    });

    if (existingAssessment) {
      // Update existing assessment
      existingAssessment.passiveAggressive =
        createAssessmentDto.passiveAggressive;
      existingAssessment.tightLoose = createAssessmentDto.tightLoose;
      existingAssessment.playStyle = createAssessmentDto.playStyle;
      existingAssessment.submittedAt = createAssessmentDto.submittedAt;
      await existingAssessment.save();

      const user = await this.userService.findById(userId);
      if (user) {
        await this.userService.updateUserPoints(user.id, 10);
      }

      const profile = await this.profileService.getProfileByUserId(userId);
      if (profile) {
        await this.profileService.updateProfileAchievements(profile.id, ['self-assessment']);
      }

      return {
        message: 'Self-assessment updated successfully',
        assessment: existingAssessment,
      };
    }

    // Create new assessment
    const assessment = new this.selfAssessmentModel({
      userId,
      passiveAggressive: createAssessmentDto.passiveAggressive,
      tightLoose: createAssessmentDto.tightLoose,
      playStyle: createAssessmentDto.playStyle,
      submittedAt: createAssessmentDto.submittedAt,
    });

    await assessment.save();

    return {
      message: 'Self-assessment created successfully',
      assessment,
    };
  }

  async createPeerAssessment(
    dto: CreatePeerAssessmentDto,
    assessorId: string,
  ) {
    // 1. Prüfen ob beide User in der gleichen Gruppe sind
    const isInGroup = await this.groupService.isUserInGroup(
      dto.groupId,
      assessorId,
    );
    if (!isInGroup) {
      throw new ForbiddenException(
        'You must be in the same group to assess this user',
      );
    }

    const assessorProfile = await this.profileService.getProfileByUserId(assessorId);
    if (assessorProfile) {
      await this.profileService.updateProfileAchievements(assessorProfile.id, ['peer-assessment']);
    }



    const isAssessedInGroup = await this.groupService.isUserInGroup(
      dto.groupId,
      dto.assessedUserId,
    );
    if (!isAssessedInGroup) {
      throw new ForbiddenException(
        'The assessed user must be in the same group',
      );
    }

    // 2. Prüfen ob der Assessor sich nicht selbst bewertet
    if (assessorId === dto.assessedUserId) {
      throw new BadRequestException('You cannot assess yourself');
    }

    // 3. Prüfen ob bereits eine Bewertung existiert
    const existingAssessment = await this.peerAssessmentModel.findOne({
      assessorUserId: assessorId,
      assessedUserId: dto.assessedUserId,
    });

    if (existingAssessment) {
      throw new BadRequestException(
        'You have already assessed this user. Each user can only be assessed once.',
      );
    }

    // 4. Peer-Bewertung speichern
    const peerAssessment = new this.peerAssessmentModel({
      assessorUserId: assessorId,
      assessedUserId: dto.assessedUserId,
      groupId: dto.groupId,
      passiveAggressive: dto.passiveAggressive,
      tightLoose: dto.tightLoose,
      playStyle: dto.playStyle,
      submittedAt: dto.submittedAt,
    });

    await peerAssessment.save();

    return {
      message: 'Peer assessment created successfully',
      assessment: peerAssessment,
    };
  }

  async getAssessmentMatrix(userId: string): Promise<AssessmentMatrixDto> {
    // 1. Selbsteinschätzung aus MongoDB abrufen
    let selfAssessment: AssessmentDataPoint | undefined;
    try {
      const selfAssessmentResult = await this.selfAssessmentModel
        .findOne({ userId })
        .lean();

      if (selfAssessmentResult) {
        selfAssessment = {
          passiveAggressive: selfAssessmentResult.passiveAggressive,
          tightLoose: selfAssessmentResult.tightLoose,
          playStyle: selfAssessmentResult.playStyle,
        };
      }
    } catch (error) {
      console.log('No self-assessment found for user', userId);
    }

    // 2. Peer-Bewertungen aus MongoDB abrufen
    const peerAssessments = await this.peerAssessmentModel
      .find({ assessedUserId: userId })
      .lean();

    const peerAssessmentsData = peerAssessments
      .map((assessment) => ({
        assessorId: assessment.assessorUserId,
        passiveAggressive: assessment.passiveAggressive,
        tightLoose: assessment.tightLoose,
        playStyle: assessment.playStyle,
        submittedAt: assessment.submittedAt,
      }))
      .filter((assessment) =>
        assessment.passiveAggressive != null &&
        assessment.tightLoose != null
      ); // Filter alte Assessments ohne neue Felder

    // 3. Durchschnitt der Peer-Bewertungen berechnen
    let averagePeerAssessment: AssessmentDataPoint | undefined;
    if (peerAssessmentsData.length > 0) {
      const sum = peerAssessmentsData.reduce(
        (acc, curr) => ({
          passiveAggressive: acc.passiveAggressive + curr.passiveAggressive,
          tightLoose: acc.tightLoose + curr.tightLoose,
        }),
        { passiveAggressive: 0, tightLoose: 0 },
      );

      const count = peerAssessmentsData.length;
      const avgPassiveAggressive = sum.passiveAggressive / count;
      const avgTightLoose = sum.tightLoose / count;

      averagePeerAssessment = {
        passiveAggressive: Math.round(avgPassiveAggressive * 10) / 10,
        tightLoose: Math.round(avgTightLoose * 10) / 10,
        playStyle: this.determinePlayStyle(
          avgPassiveAggressive,
          avgTightLoose,
        ),
      };
    }

    return {
      userId,
      selfAssessment,
      peerAssessments: peerAssessmentsData,
      averagePeerAssessment,
    };
  }

  private determinePlayStyle(
    passiveAggressive: number,
    tightLoose: number,
  ): string {
    // passiveAggressive: 0-10 (0 = passiv, 10 = aggressiv)
    // tightLoose: 0-10 (0 = tight, 10 = loose)

    const isAggressive = passiveAggressive > 5;
    const isLoose = tightLoose > 5;

    if (isLoose && isAggressive) {
      return 'Loose-Aggressive (LAG)';
    } else if (isLoose && !isAggressive) {
      return 'Loose-Passive';
    } else if (!isLoose && isAggressive) {
      return 'Tight-Aggressive (TAG)';
    } else if (!isLoose && !isAggressive) {
      return 'Tight-Passive';
    } else {
      return 'Ausgeglichen';
    }
  }

  // Berechne euklidische Distanz zwischen zwei Assessments
  private calculateDistance(
    a: { passiveAggressive: number; tightLoose: number },
    b: { passiveAggressive: number; tightLoose: number },
  ): number {
    const dx = a.passiveAggressive - b.passiveAggressive;
    const dy = a.tightLoose - b.tightLoose;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Berechne Similarity Score (0-100, höher = ähnlicher)
  private calculateSimilarity(distance: number): number {
    // Maximale Distanz in 2D-Raum (0-10, 0-10) ist sqrt(10^2 + 10^2) ≈ 14.14
    const maxDistance = Math.sqrt(10 * 10 + 10 * 10);
    // Invertiere die Distanz zu einem Similarity-Score
    const similarity = 1 - distance / maxDistance;
    return Math.round(similarity * 100);
  }

  async findSimilarPlayers(
    userId: string,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      // 1. Lade eigenes Assessment
      const myAssessment = await this.selfAssessmentModel
        .findOne({ userId })
        .lean();

      if (!myAssessment) {
        return [];
      }

      // 2. Lade alle anderen Assessments
      const allAssessments = await this.selfAssessmentModel
        .find({ userId: { $ne: userId } })
        .lean();

      // 3. Berechne Distanzen und sortiere
      const matches = allAssessments
        .map((assessment) => {
          const distance = this.calculateDistance(myAssessment, assessment);
          const similarity = this.calculateSimilarity(distance);

          return {
            userId: assessment.userId,
            similarity: similarity / 100, // 0-1 für Kompatibilität
            matchScore: similarity,
            assessment: {
              passiveAggressive: assessment.passiveAggressive,
              tightLoose: assessment.tightLoose,
              playStyle: assessment.playStyle,
            },
            distance,
          };
        })
        .sort((a, b) => a.distance - b.distance) // Sortiere nach Distanz (kleinste zuerst)
        .slice(0, limit);

      return matches;
    } catch (error) {
      console.error('Error finding similar players:', error);
      return [];
    }
  }

  async matchPlayersByAssessment(
    userId: string,
    targetPlayStyle?: string,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      // 1. Lade eigenes Assessment
      const myAssessment = await this.selfAssessmentModel
        .findOne({ userId })
        .lean();

      if (!myAssessment) {
        return [];
      }

      // 2. Lade alle anderen Assessments (optional mit PlayStyle-Filter)
      const query: any = { userId: { $ne: userId } };
      if (targetPlayStyle) {
        query.playStyle = targetPlayStyle;
      }

      const allAssessments = await this.selfAssessmentModel
        .find(query)
        .lean();

      // 3. Berechne Distanzen und sortiere
      const matches = allAssessments
        .map((assessment) => {
          const distance = this.calculateDistance(myAssessment, assessment);
          const matchScore = this.calculateSimilarity(distance);

          return {
            userId: assessment.userId,
            matchScore,
            playStyle: assessment.playStyle,
            passiveAggressive: assessment.passiveAggressive,
            tightLoose: assessment.tightLoose,
            distance,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return matches;
    } catch (error) {
      console.error('Error matching players by assessment:', error);
      return [];
    }
  }

  async findMatches(userId: string, limit: number = 20): Promise<any> {
    try {
      // 1. Hole eigenes Assessment & Matrix
      const myMatrix = await this.getAssessmentMatrix(userId);

      // 2. Falls kein Assessment vorhanden
      if (!myMatrix.selfAssessment) {
        return {
          hasAssessment: false,
          myAssessment: null,
          myMatrix: null,
          matches: [],
        };
      }

      // 3. Lade alle anderen Assessments
      const allAssessments = await this.selfAssessmentModel
        .find({ userId: { $ne: userId } })
        .lean();

      // 4. Berechne Distanzen und sortiere
      const matchesWithoutProfiles = allAssessments
        .map((assessment) => {
          const distance = this.calculateDistance(
            myMatrix.selfAssessment!,
            assessment,
          );
          const matchScore = this.calculateSimilarity(distance);

          return {
            userId: assessment.userId,
            matchScore,
            similarity: matchScore / 100,
            assessment: {
              passiveAggressive: assessment.passiveAggressive,
              tightLoose: assessment.tightLoose,
              playStyle: assessment.playStyle,
            },
            // Matrix-Koordinaten (für Frontend)
            coordinates: {
              x: assessment.passiveAggressive, // 0-10 (passiv-aggressiv)
              y: assessment.tightLoose, // 0-10 (tight-loose)
            },
            distance,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      // 5. Lade Profile-Daten für alle Matches
      const matchesWithProfiles = await Promise.all(
        matchesWithoutProfiles.map(async (match) => {
          try {
            console.log(
              `[MATCHING] Searching profile for userId: ${match.userId}`,
            );
            const profile = await this.profileService.getProfileByUserId(
              String(match.userId),
            );
            console.log(
              `[MATCHING] Profile found: ${profile ? 'Yes' : 'No'} - Username: ${profile?.username || 'N/A'}`,
            );
            return {
              ...match,
              profile: profile
                ? {
                    id: profile.id,
                    username: profile.username,
                    profileImageUrl: profile.profileImageUrl,
                  }
                : null,
            };
          } catch (error) {
            console.error(
              `[MATCHING] Error loading profile for user ${match.userId}:`,
              error.message,
            );
            return {
              ...match,
              profile: null,
            };
          }
        }),
      );

      // Filtere Matches ohne Profile heraus
      const matches = matchesWithProfiles.filter(
        (match) => match.profile !== null,
      );
      console.log(
        `[MATCHING] Filtered matches: ${matchesWithProfiles.length} -> ${matches.length} (removed ${matchesWithProfiles.length - matches.length} without profiles)`,
      );

      // 6. Berechne eigene Koordinaten
      const myCoordinates = {
        x: myMatrix.selfAssessment.passiveAggressive, // 0-10
        y: myMatrix.selfAssessment.tightLoose, // 0-10
      };

      return {
        hasAssessment: true,
        myAssessment: myMatrix.selfAssessment,
        myMatrix: {
          selfAssessment: myMatrix.selfAssessment,
          averagePeerAssessment: myMatrix.averagePeerAssessment,
          peerAssessments: myMatrix.peerAssessments,
          coordinates: myCoordinates,
        },
        matches,
        totalMatches: matches.length,
      };
    } catch (error) {
      console.error('Error finding matches:', error);
      return {
        hasAssessment: false,
        myAssessment: null,
        myMatrix: null,
        matches: [],
      };
    }
  }

  // ----------------------------------------------------------------------------
  // EVENT RECOMMENDATIONS BASED ON USER PREFERENCES ---------------------------
  // ----------------------------------------------------------------------------

  /**
   * Konvertiert Nutzervorlieben zu einem Text-String für Embedding
   */
  private preferencesToText(preferences: OnboardingPreferencesDto): string {
    if (!preferences || typeof preferences !== 'object') {
      return '';
    }

    const sections: string[] = [];

    // Hilfsfunktion: Konvertiert Feldnamen in lesbare Labels
    const toLabel = (key: string | undefined | null): string => {
      if (!key || typeof key !== 'string') {
        return '';
      }
      return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Hilfsfunktion: Formatiert Arrays zu Strings
    const formatArray = (arr: any[]): string => {
      if (!Array.isArray(arr)) {
        return '';
      }
      return arr
        .filter(item => item !== null && item !== undefined && item !== '')
        .map(item => String(item))
        .join(', ');
    };

    // Rekursive Funktion zum Durchlaufen der Struktur
    const processValue = (value: any, label: string, indent: number = 0): string => {
      if (!label || label.trim() === '') {
        return '';
      }
      
      const indentStr = '  '.repeat(indent);
      
      if (Array.isArray(value)) {
        const formatted = formatArray(value);
        return formatted ? `${indentStr}${label}: ${formatted}` : '';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        const lines: string[] = [];
        const hasContent = Object.keys(value).some(key => {
          const val = value[key];
          return val !== null && val !== undefined && 
                 (Array.isArray(val) ? val.length > 0 : typeof val === 'object' ? Object.keys(val).length > 0 : val !== '');
        });
        
        if (hasContent) {
          lines.push(`${indentStr}${label}:`);
          for (const [key, val] of Object.entries(value)) {
            if (val !== null && val !== undefined) {
              const subLabel = toLabel(key);
              if (subLabel) {
                const subLine = processValue(val, subLabel, indent + 1);
                if (subLine && subLine.trim()) {
                  lines.push(subLine);
                }
              }
            }
          }
        }
        return lines.join('\n');
      } else if (value !== null && value !== undefined && value !== '') {
        return `${indentStr}${label}: ${String(value)}`;
      }
      return '';
    };

    // Hauptlogik: Durchlaufe alle Top-Level-Keys
    for (const [key, value] of Object.entries(preferences)) {
      if (value !== null && value !== undefined) {
        const sectionLabel = toLabel(key);
        if (sectionLabel) {
          const sectionText = processValue(value, sectionLabel, 0);
          if (sectionText && sectionText.trim()) {
            sections.push(sectionText);
          }
        }
      }
    }

    const result = sections.join('\n\n').trim();
    return result || '';
  }

  /**
   * Extrahiert Event-ID aus Qdrant Payload
   */
  private extractEventIdFromPayload(payload: any): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const candidate =
      payload.eventId ?? payload.id ?? payload.sourceId ?? payload.originalId;

    if (typeof candidate === 'string' && candidate.length) {
      return candidate;
    }

    return undefined;
  }

  /**
   * Findet passende Events basierend auf Nutzervorlieben mittels Vector-Suche
   * @param preferences - Die Vorlieben des Nutzers
   * @param limit - Anzahl der zurückzugebenden Events (Standard: 20)
   * @returns Array von passenden Events
   */
  async findEventsByPreferences(
    preferences: OnboardingPreferencesDto,
    limit: number = 20,
  ): Promise<Event[]> {
    try {
      // Konvertiere Vorlieben zu Text
      const preferencesText = this.preferencesToText(preferences);
      
      if (!preferencesText || preferencesText.trim() === '') {
        throw new BadRequestException(
          'Preferences must contain at least one valid preference',
        );
      }

      // Erstelle Embedding aus den Vorlieben
      let searchVector: number[];
      try {
        searchVector = await this.chatGptService.createEmbeddingV2(preferencesText);
      } catch (error) {
        console.error('Failed to create embedding for preferences:', error);
        throw new BadRequestException('Failed to process preferences');
      }

      // Filter für kommende Events (nur zukünftige Events)
      const now = new Date();
      const nowTimestamp = Math.floor(now.getTime() / 1000);
      
      const dateFilter = {
        must: [
          {
            key: 'start_time',
            range: {
              gte: nowTimestamp,
            },
          },
        ],
      };

      // Führe Vector-Suche durch
      const searchResults = await this.qdrantService.searchEventsSimilar({
        vector: searchVector,
        limit,
        filter: dateFilter,
        withPayload: true,
      });

      // Extrahiere Event-IDs aus den Ergebnissen
      const eventIds = searchResults
        .map((hit) => this.extractEventIdFromPayload(hit.payload))
        .filter((id): id is string => Boolean(id));

      if (eventIds.length === 0) {
        return [];
      }

      // Lade Events aus der Datenbank
      const events = await Promise.all(
        eventIds.map((id) => this.eventRepository.findById(id)),
      );

      return events.filter((event): event is Event => event !== null);
    } catch (error) {
      console.error('Error finding events by preferences:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find events based on preferences');
    }
  }
}
