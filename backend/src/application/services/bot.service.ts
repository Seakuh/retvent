import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { ImageService } from 'src/infrastructure/services/image.service';
import { MongoEventRepository } from 'src/infrastructure/repositories/mongodb/event.repository';
import { CommentService } from './comment.service';
import { EventService } from './event.service';
import { Event } from 'src/core/domain';
@Injectable()
export class BotService {
  constructor(
    private readonly eventService: EventService,
    private readonly commentService: CommentService,
    private readonly chatgptService: ChatGPTService,
    private readonly imageService: ImageService,
    private readonly authService: AuthService,
    private readonly eventRepository: MongoEventRepository,
  ) {}

  private readonly profilePrompts = new Map<string, string>([
    [
      '67eae24a9ace3b80d04bbcee',
      'Du bist ScanTIger – eine weiße, belesene Katze 🐱📚, die stets kluge und gut recherchierte Informationen teilt.',
    ],
    [
      '67ffcca2b317eb02b9908992',
      'Du bist GOSI – ein imaginärer Superheld 🦸‍♂️🌍, der die Welt erforscht und heldenhaft rettet.',
    ],
    [
      '68001604f9ecc9277ec87e66',
      'Du bist HappyTrappy – eine elegante Seele 🌸🛫, die das Leben in vollen Zügen genießt und die Welt auf stilvolle Weise entdecken möchte.',
    ],
    [
      '67f435e4396c4cacded4ef26',
      'Du bist DamnSOnderman – ein abgewichstes, erfahrenes Eichhörnchen 🐿️🍂, mürrisch aber tief drinnen freundlich.',
    ],
    [
      '67f4132f396c4cacded4e3e5',
      'Du bist DaManpfrd – super nett und wohltuend ☀️💛, du schreibst auf niedliche, fröhliche und positive Weise.',
    ],
  ]);

  private readonly logger = new Logger(BotService.name);

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Cron job executed');
    const randomNewEvent = (await this.eventService.findLatest(30)).at(
      Math.floor(Math.random() * 10),
    );
    const keys = Array.from(this.profilePrompts.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const charactersPrompt = this.profilePrompts.get(randomKey);

    const comment = await this.chatgptService.generateCommentForEvent(
      charactersPrompt,
      randomNewEvent,
    );

    const comments = await this.commentService.createCommentToEvent(
      randomNewEvent.id,
      {
        text: comment,
      },
      randomKey,
    );

    await this.eventService.botViewEvent(randomNewEvent.id);
    console.log(comments);
  }

  // @Cron(CronExpression.EVERY_SECOND)
  // async handleCron2() {
  //   const events = await this.eventService.searchEventsWithUserInput();
  //   for (const event of events) {
  //     const eventWithHost =
  //       await this.eventService.getEventByIdWithHostInformation(event.id);
  //     await this.eventService.update(event.id, {
  //       host: {
  //         profileImageUrl: eventWithHost.host.profileImageUrl,
  //         username: eventWithHost.host.username,
  //       },
  //     });
  //   }
  // }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAnswerCron() {
    this.logger.log('Answer Cron job executed');
    const randomNewEvent = (await this.eventService.findLatest(30)).at(
      Math.floor(Math.random() * 10),
    );
    const keys = Array.from(this.profilePrompts.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const charactersPrompt = this.profilePrompts.get(randomKey);

    const comments = await this.commentService.findByEventId(randomNewEvent.id);
    const randomComment = comments.at(
      Math.floor(Math.random() * comments.length),
    );

    const comment = await this.chatgptService.generateReplyCommentForEvent(
      charactersPrompt,
      randomNewEvent,
      randomComment.text,
    );

    const replyComment = await this.commentService.createCommentToEvent(
      randomNewEvent.id,
      {
        text: comment,
        parentId: randomComment.id || undefined,
      },
      randomKey,
    );

    await this.eventService.botViewEvent(randomNewEvent.id);

    console.log(replyComment);
  }

  /**
   * Generiert 10 neue Events von ChatGPT, lädt die Bilder hoch,
   * erstellt neue Profile und erstellt die Events
   */
  //@Cron(CronExpression.EVERY_10_SECONDS)
  async generateAndCreateEventsWithProfiles() {
    this.logger.log('🚀 Starte Generierung von 10 neuen Events mit Profilen...');

    try {
      // 1. ChatGPT nach 10 Events fragen
      this.logger.log('📡 Frage ChatGPT nach 10 neuen Events...');
      const events = await this.chatgptService.generate10NewEvents(2);
      console.log(events);
      this.logger.log(`✅ ${events.length} Events von ChatGPT erhalten`);

      const createdEvents = [];

      // 2. Für jedes Event: Bild herunterladen, hochladen, Profil erstellen, Event erstellen
      for (let i = 0; i < events.length; i++) {
        const eventData = events[i];
        this.logger.log(`\n📅 Verarbeite Event ${i + 1}/${events.length}: ${eventData.title}`);

        try {
          // 2.1 Bild herunterladen und hochladen (optional)
          let uploadedImageUrl = eventData.imageUrl;
          if (eventData.imageUrl) {
            this.logger.log(`📥 Versuche Bild herunterzuladen: ${eventData.imageUrl}`);
            try {
              const imageBuffer = await this.downloadImage(eventData.imageUrl);
              if (imageBuffer) {
                this.logger.log(`✅ Bild erfolgreich heruntergeladen (${imageBuffer.length} bytes)`);
                
                this.logger.log(`📤 Lade Bild hoch...`);
                uploadedImageUrl = await this.imageService.uploadImageFromBuffer(imageBuffer);
                this.logger.log(`✅ Bild erfolgreich hochgeladen: ${uploadedImageUrl}`);
              } else {
                this.logger.warn(`⚠️ Bild konnte nicht heruntergeladen werden, verwende ursprüngliche URL`);
                uploadedImageUrl = eventData.imageUrl;
              }
            } catch (imageError) {
              this.logger.warn(`⚠️ Fehler beim Herunterladen/Hochladen des Bildes: ${imageError.message}`);
              this.logger.warn(`⚠️ Verwende ursprüngliche Image URL: ${eventData.imageUrl}`);
              uploadedImageUrl = eventData.imageUrl;
            }
          } else {
            this.logger.warn(`⚠️ Keine Image URL für Event: ${eventData.title}`);
            uploadedImageUrl = undefined;
          }

          // 2.2 Neues Profil erstellen

          const username =  await this.chatgptService.generateUsername()|| `event_${Date.now()}_${i}`;
          const email = `${username}@events.local`;
          const password = `Event${Math.random().toString(36).slice(2)}!`;

          this.logger.log(`👤 Erstelle neues Profil: ${username}`);
          const registrationResult = await this.authService.registerWithProfile({
            email,
            username,
            password,
          });
          const hostId = registrationResult.user.id;
          this.logger.log(`✅ Profil erstellt: ${username} (ID: ${hostId})`);

          // 2.3 Event erstellen
          const eventToCreate: Partial<Event> = {
            title: eventData.title,
            description: eventData.description,
            startDate: new Date(eventData.startDate),
            startTime: eventData.startTime || '20:00',
            hostId: hostId,
            hostUsername: username,
            hostImageUrl: uploadedImageUrl,
            city: eventData.city,
            category: eventData.category,
            price: eventData.price,
            ticketLink: eventData.ticketLink,
            lineup: eventData.lineup,
            socialMediaLinks: eventData.socialMediaLinks,
            tags: eventData.tags,
            email: eventData.email,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Füge imageUrl nur hinzu, wenn vorhanden
          if (uploadedImageUrl) {
            eventToCreate.imageUrl = uploadedImageUrl;
          }

          this.logger.log(`🎉 Erstelle Event: ${eventData.title}`);
          const createdEvent = await this.eventRepository.create(eventToCreate);
          createdEvents.push(createdEvent);
          this.logger.log(`✅ Event erfolgreich erstellt: ${createdEvent.id}`);

        } catch (error) {
          this.logger.error(`❌ Fehler beim Verarbeiten von Event ${i + 1}: ${error.message}`);
          this.logger.error(error.stack);
          // Weiter mit dem nächsten Event
          continue;
        }
      }

      this.logger.log(`\n🎊 Fertig! ${createdEvents.length}/${events.length} Events erfolgreich erstellt`);
      return {
        success: true,
        totalRequested: events.length as number,
        totalCreated: createdEvents.length,
        events: createdEvents,
      };

    } catch (error) {
      this.logger.error(`❌ Kritischer Fehler: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  /**
   * Lädt ein Bild von einer URL herunter (optional - gibt null zurück bei Fehler)
   */
  private async downloadImage(url: string): Promise<Buffer | null> {
    // Instagram URL ggf. anpassen
    if (url.includes('instagram.com')) {
      url = url.split('?')[0].replace(/\d+_n\.jpg$/, '1080_n.jpg');
    }

    // Versuche zuerst direkt ohne Proxy
    try {
      const directResponse = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 5000,
      });

      const contentType = directResponse.headers['content-type'];
      if (contentType?.startsWith('image/')) {
        this.logger.log(`✅ Bild direkt geladen von ${url}`);
        return Buffer.from(directResponse.data, 'binary');
      }
    } catch (directError) {
      this.logger.debug(`Direkter Download fehlgeschlagen, versuche Proxies...`);
    }

    // Falls direkter Download fehlschlägt, versuche Proxies
    const proxyServices = [
      (url: string) =>
        `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
      (url: string) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const proxyFn of proxyServices) {
      const proxyUrl = proxyFn(url);
      this.logger.debug(`🔁 Versuche Proxy: ${proxyUrl}`);

      try {
        const response = await axios.get(proxyUrl, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          timeout: 5000,
        });

        const contentType = response.headers['content-type'];
        if (contentType?.startsWith('image/')) {
          this.logger.log(`✅ Bild erfolgreich geladen von Proxy`);
          return Buffer.from(response.data, 'binary');
        }
      } catch (err) {
        // Weiter zum nächsten Proxy
        continue;
      }
    }

    // Alle Versuche fehlgeschlagen - gibt null zurück statt Error zu werfen
    this.logger.warn(`⚠️ Bild konnte nicht heruntergeladen werden: ${url}`);
    return null;
  }
}
