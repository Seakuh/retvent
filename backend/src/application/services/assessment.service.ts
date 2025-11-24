import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { CreateAssessmentDto } from 'src/presentation/dtos/create-assessment.dto';
import { QdrantService } from '../../infrastructure/services/qdrant.service';
import { IPeerAssessment } from 'src/core/domain/peer-assessment.schema';
import { CreatePeerAssessmentDto } from 'src/presentation/dtos/create-peer-assessment.dto';
import { GroupService } from './group.service';
import {
  AssessmentMatrixDto,
  AssessmentDataPoint,
} from 'src/presentation/dtos/assessment-matrix.dto';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly chatgptService: ChatGPTService,
    private readonly qdrantService: QdrantService,
    private readonly groupService: GroupService,
    @InjectModel('PeerAssessment')
    private readonly peerAssessmentModel: Model<IPeerAssessment>,
  ) {}

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ) {
    const text = JSON.stringify(createAssessmentDto);

    const embedding = await this.chatgptService.createEmbedding(text);
    if (!embedding) {
      throw new Error(
        'Failed to create embedding - ChatGPT service not initialized',
      );
    }
    console.log('embedding', embedding);
    const assessment = await this.qdrantService.upsertAssessments([
      {
        id: userId,
        vector: embedding,
        payload: createAssessmentDto,
      },
    ]);
    return assessment;
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
      assessorId,
      assessedId: dto.assessedUserId,
    });

    if (existingAssessment) {
      throw new BadRequestException(
        'You have already assessed this user. Each user can only be assessed once.',
      );
    }

    // 4. Peer-Bewertung speichern
    const peerAssessment = new this.peerAssessmentModel({
      assessorId,
      assessedId: dto.assessedUserId,
      groupId: dto.groupId,
      loose: dto.loose,
      tight: dto.tight,
      aggressive: dto.aggressive,
      passive: dto.passive,
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
    // 1. Selbsteinschätzung aus Qdrant abrufen
    let selfAssessment: AssessmentDataPoint | undefined;
    try {
      const selfAssessmentResult = await this.qdrantService.retrievePoints(
        'assessment_embeddings',
        [userId],
        { withPayload: true, withVector: false },
      );

      if (selfAssessmentResult && selfAssessmentResult.length > 0) {
        const payload = selfAssessmentResult[0].payload as any;
        selfAssessment = {
          loose: payload.loose,
          tight: payload.tight,
          aggressive: payload.aggressive,
          passive: payload.passive,
          playStyle: payload.playStyle,
        };
      }
    } catch (error) {
      console.log('No self-assessment found for user', userId);
    }

    // 2. Peer-Bewertungen aus MongoDB abrufen
    const peerAssessments = await this.peerAssessmentModel
      .find({ assessedId: userId })
      .lean();

    const peerAssessmentsData = peerAssessments.map((assessment) => ({
      assessorId: assessment.assessorId,
      loose: assessment.loose,
      tight: assessment.tight,
      aggressive: assessment.aggressive,
      passive: assessment.passive,
      playStyle: assessment.playStyle,
      submittedAt: assessment.submittedAt,
    }));

    // 3. Durchschnitt der Peer-Bewertungen berechnen
    let averagePeerAssessment: AssessmentDataPoint | undefined;
    if (peerAssessmentsData.length > 0) {
      const sum = peerAssessmentsData.reduce(
        (acc, curr) => ({
          loose: acc.loose + curr.loose,
          tight: acc.tight + curr.tight,
          aggressive: acc.aggressive + curr.aggressive,
          passive: acc.passive + curr.passive,
        }),
        { loose: 0, tight: 0, aggressive: 0, passive: 0 },
      );

      const count = peerAssessmentsData.length;
      const avgLoose = sum.loose / count;
      const avgTight = sum.tight / count;
      const avgAggressive = sum.aggressive / count;
      const avgPassive = sum.passive / count;

      averagePeerAssessment = {
        loose: Math.round(avgLoose * 10) / 10,
        tight: Math.round(avgTight * 10) / 10,
        aggressive: Math.round(avgAggressive * 10) / 10,
        passive: Math.round(avgPassive * 10) / 10,
        playStyle: this.determinePlayStyle(
          avgLoose,
          avgTight,
          avgAggressive,
          avgPassive,
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
    loose: number,
    tight: number,
    aggressive: number,
    passive: number,
  ): string {
    if (loose > tight && aggressive > passive) {
      return 'Loose-Aggressive (LAG)';
    } else if (loose > tight && passive > aggressive) {
      return 'Loose-Passive';
    } else if (tight > loose && aggressive > passive) {
      return 'Tight-Aggressive (TAG)';
    } else if (tight > loose && passive > aggressive) {
      return 'Tight-Passive';
    } else {
      return 'Ausgeglichen';
    }
  }

  async findSimilarPlayers(
    userId: string,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      // 1. Lade Vector des Users aus Qdrant
      const userVector = await this.qdrantService.loadVectorById(
        'assessment_embeddings',
        userId,
      );

      // 2. Suche ähnliche Spieler basierend auf Assessment-Vector
      const similarPlayers = await this.qdrantService.searchAssessments({
        vector: userVector,
        limit: limit + 1, // +1 weil wir den User selbst filtern
        withPayload: true,
        scoreThreshold: 0.7, // Mindest-Ähnlichkeit
      });

      // 3. Filtere den User selbst aus und formatiere Ergebnisse
      const matches = similarPlayers
        .filter((player) => player.id !== userId)
        .slice(0, limit)
        .map((player) => ({
          userId: player.id,
          similarity: player.score,
          assessment: player.payload,
        }));

      return matches;
    } catch (error) {
      console.error('Error finding similar players:', error);
      // Falls User noch kein Assessment hat, gib leeres Array zurück
      return [];
    }
  }

  async matchPlayersByAssessment(
    userId: string,
    targetPlayStyle?: string,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      // 1. Lade Vector des Users aus Qdrant
      const userVector = await this.qdrantService.loadVectorById(
        'assessment_embeddings',
        userId,
      );

      // 2. Optional: Filter nach Spielstil
      const filter = targetPlayStyle
        ? {
            must: [
              {
                key: 'playStyle',
                match: { value: targetPlayStyle },
              },
            ],
          }
        : undefined;

      // 3. Suche ähnliche Spieler
      const similarPlayers = await this.qdrantService.searchAssessments({
        vector: userVector,
        limit: limit + 1,
        filter,
        withPayload: true,
        scoreThreshold: 0.6,
      });

      // 4. Filtere und formatiere
      const matches = similarPlayers
        .filter((player) => player.id !== userId)
        .slice(0, limit)
        .map((player) => ({
          userId: player.id,
          matchScore: Math.round(player.score * 100),
          playStyle: player.payload?.playStyle,
          loose: player.payload?.loose,
          tight: player.payload?.tight,
          aggressive: player.payload?.aggressive,
          passive: player.payload?.passive,
        }));

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

      // 3. Lade Vector und finde ähnliche Spieler
      const userVector = await this.qdrantService.loadVectorById(
        'assessment_embeddings',
        userId,
      );

      const similarPlayers = await this.qdrantService.searchAssessments({
        vector: userVector,
        limit: limit + 1,
        withPayload: true,
        scoreThreshold: 0.5, // Niedrigerer Threshold für mehr Matches
      });

      // 4. Formatiere Matches mit allen Details
      const matches = similarPlayers
        .filter((player) => player.id !== userId)
        .slice(0, limit)
        .map((player) => {
          const assessment = player.payload;
          return {
            userId: player.id,
            matchScore: Math.round(player.score * 100),
            similarity: player.score,
            assessment: {
              loose: assessment?.loose || 5,
              tight: assessment?.tight || 5,
              aggressive: assessment?.aggressive || 5,
              passive: assessment?.passive || 5,
              playStyle: assessment?.playStyle || 'Unbekannt',
            },
            // Berechne Koordinaten für Matrix (loose-tight vs aggressive-passive)
            coordinates: {
              x: (assessment?.loose || 5) - (assessment?.tight || 5), // -9 bis +9
              y: (assessment?.aggressive || 5) - (assessment?.passive || 5), // -9 bis +9
            },
          };
        });

      // 5. Berechne eigene Koordinaten
      const myCoordinates = {
        x:
          myMatrix.selfAssessment.loose - myMatrix.selfAssessment.tight,
        y:
          myMatrix.selfAssessment.aggressive -
          myMatrix.selfAssessment.passive,
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
}
