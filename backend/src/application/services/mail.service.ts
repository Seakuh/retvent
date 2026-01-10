import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ImageService } from '../../infrastructure/services/image.service';
import { EventService } from './event.service';
import { ProfileService } from './profile.service';
import { ChatGPTService } from '../../infrastructure/services/chatgpt.service';
import { Event } from '../../core/domain/event';

export interface ReceivedEmail {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  date?: Date;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    content?: Buffer;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly imageService: ImageService,
    private readonly eventService: EventService,
    private readonly profileService: ProfileService,
    private readonly chatGptService: ChatGPTService,
  ) {}

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`E-Mail erfolgreich gesendet an: ${to}`);
    } catch (error) {
      this.logger.error(`Fehler beim Senden der E-Mail an ${to}:`, error);
      throw error;
    }
  }

  async sendHtmlEmail(to: string, subject: string, html: string) {
    return this.sendEmail(to, subject, '', html);
  }

  /**
   * Empfängt eine E-Mail und loggt alle Details
   * Diese Methode wird von Webhook-Endpoints oder IMAP-Polling aufgerufen
   * 
   * @param email - Die empfangene E-Mail mit allen Details
   */
  async receiveEmail(email: ReceivedEmail): Promise<void> {
    try {
      // Logge alle E-Mail-Details
      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log('📧 NEUE E-MAIL EMPFANGEN');
      this.logger.log('═══════════════════════════════════════════════════════');
      
      this.logger.log(`Von: ${email.from}`);
      this.logger.log(`An: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`);
      this.logger.log(`Betreff: ${email.subject}`);
      
      if (email.date) {
        this.logger.log(`Datum: ${email.date.toISOString()}`);
      }
      
      if (email.text) {
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log('Text-Inhalt:');
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log(email.text);
      }
      
      if (email.html) {
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log('HTML-Inhalt:');
        this.logger.log('───────────────────────────────────────────────────────');
        // Logge HTML-Inhalt (kann sehr lang sein, daher nur erste 500 Zeichen)
        const htmlPreview = email.html.length > 500 
          ? email.html.substring(0, 500) + '... [gekürzt]'
          : email.html;
        this.logger.log(htmlPreview);
      }
      
      if (email.headers && Object.keys(email.headers).length > 0) {
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log('Header:');
        this.logger.log('───────────────────────────────────────────────────────');
        Object.entries(email.headers).forEach(([key, value]) => {
          this.logger.log(`${key}: ${value}`);
        });
      }
      
      if (email.attachments && email.attachments.length > 0) {
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log('Anhänge:');
        this.logger.log('───────────────────────────────────────────────────────');
        email.attachments.forEach((attachment, index) => {
          this.logger.log(`${index + 1}. ${attachment.filename} (${attachment.contentType}, ${attachment.size} bytes)`);
        });
      }
      
      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log('✅ E-Mail erfolgreich geloggt');
      this.logger.log('═══════════════════════════════════════════════════════');
      
      // Extrahiere und logge alle Bilder und Texte
      await this.extractAndLogImagesAndText(email);

      // Extrahiere Events aus E-Mail und füge sie in die Datenbank ein
      await this.extractAndCreateEventsFromEmail(email);
    } catch (error) {
      this.logger.error('Fehler beim Loggen der empfangenen E-Mail:', error);
      throw error;
    }
  }

  /**
   * Extrahiert alle Bilder aus einer E-Mail und loggt alle Texte
   * 
   * Diese Funktion:
   * - Extrahiert Bilder aus Anhängen
   * - Extrahiert Bilder aus HTML (embedded images, base64, URLs)
   * - Loggt alle gefundenen Texte
   * - Speichert Bildinformationen
   * 
   * @param email - Die empfangene E-Mail
   */
  async extractAndLogImagesAndText(email: ReceivedEmail): Promise<void> {
    try {
      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log('🖼️ BILDER- UND TEXT-EXTRAKTION');
      this.logger.log('═══════════════════════════════════════════════════════');

      // 1. Extrahiere alle Texte
      await this.extractAndLogTexts(email);

      // 2. Extrahiere und speichere Bilder aus Anhängen
      await this.extractAndSaveImagesFromAttachments(email);

      // 3. Extrahiere und speichere Bilder aus HTML
      await this.extractAndSaveImagesFromHtml(email);

      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log('✅ Bild- und Text-Extraktion abgeschlossen');
      this.logger.log('═══════════════════════════════════════════════════════');
    } catch (error) {
      this.logger.error('Fehler bei der Bild- und Text-Extraktion:', error);
    }
  }

  /**
   * Extrahiert und loggt alle Texte aus der E-Mail
   */
  private async extractAndLogTexts(email: ReceivedEmail): Promise<void> {
    this.logger.log('───────────────────────────────────────────────────────');
    this.logger.log('📝 TEXT-EXTRAKTION');
    this.logger.log('───────────────────────────────────────────────────────');

    // Text-Inhalt
    if (email.text) {
      this.logger.log('📄 Plain-Text:');
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log(email.text);
      this.logger.log(`📊 Text-Länge: ${email.text.length} Zeichen`);
    }

    // HTML-Inhalt (nur Text ohne HTML-Tags)
    if (email.html) {
      // Entferne HTML-Tags für reinen Text
      const textFromHtml = email.html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Entferne Scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Entferne Styles
        .replace(/<[^>]+>/g, ' ') // Entferne alle HTML-Tags
        .replace(/\s+/g, ' ') // Normalisiere Whitespace
        .trim();

      if (textFromHtml.length > 0) {
        this.logger.log('📄 Text aus HTML (ohne Tags):');
        this.logger.log('───────────────────────────────────────────────────────');
        this.logger.log(textFromHtml);
        this.logger.log(`📊 Text-Länge: ${textFromHtml.length} Zeichen`);
      }

      // Logge auch den vollständigen HTML-Inhalt
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log('📄 Vollständiger HTML-Inhalt:');
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log(email.html);
      this.logger.log(`📊 HTML-Länge: ${email.html.length} Zeichen`);
    }

    // Betreff als Text
    if (email.subject) {
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log('📌 Betreff:');
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log(email.subject);
    }
  }

  /**
   * Extrahiert und speichert Bilder aus E-Mail-Anhängen
   */
  private async extractAndSaveImagesFromAttachments(email: ReceivedEmail): Promise<void> {
    if (!email.attachments || email.attachments.length === 0) {
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log('📎 Keine Anhänge gefunden');
      return;
    }

    this.logger.log('───────────────────────────────────────────────────────');
    this.logger.log('📎 BILDER AUS ANHÄNGEN');
    this.logger.log('───────────────────────────────────────────────────────');

    const imageAttachments = email.attachments.filter((att) =>
      att.contentType?.startsWith('image/'),
    );

    if (imageAttachments.length === 0) {
      this.logger.log('Keine Bild-Anhänge gefunden');
      return;
    }

    this.logger.log(`🖼️ ${imageAttachments.length} Bild(er) in Anhängen gefunden:`);

    for (const [index, attachment] of imageAttachments.entries()) {
      this.logger.log(`───────────────────────────────────────────────────────`);
      this.logger.log(`Bild ${index + 1}:`);
      this.logger.log(`  Dateiname: ${attachment.filename}`);
      this.logger.log(`  Content-Type: ${attachment.contentType}`);
      this.logger.log(`  Größe: ${attachment.size} bytes (${(attachment.size / 1024).toFixed(2)} KB)`);

      if (attachment.content) {
        this.logger.log(`  ✅ Bilddaten vorhanden (${attachment.content.length} bytes)`);
        
        try {
          // Speichere das Bild über ImageService
          const imageUrl = await this.imageService.uploadImageFromBuffer(
            attachment.content,
            attachment.contentType || 'image/jpeg',
            attachment.filename,
          );
          
          this.logger.log(`  💾 Bild erfolgreich gespeichert:`);
          this.logger.log(`  📎 URL: ${imageUrl}`);
        } catch (error) {
          this.logger.error(`  ❌ Fehler beim Speichern des Bildes:`, error);
        }
      } else {
        this.logger.log(`  ⚠️ Keine Bilddaten vorhanden (nur Metadaten)`);
      }
    }
  }

  /**
   * Extrahiert und speichert Bilder aus HTML-Inhalt
   */
  private async extractAndSaveImagesFromHtml(email: ReceivedEmail): Promise<void> {
    if (!email.html) {
      this.logger.log('───────────────────────────────────────────────────────');
      this.logger.log('📄 Kein HTML-Inhalt vorhanden');
      return;
    }

    this.logger.log('───────────────────────────────────────────────────────');
    this.logger.log('🖼️ BILDER AUS HTML');
    this.logger.log('───────────────────────────────────────────────────────');

    const images: Array<{
      type: 'url' | 'base64' | 'cid';
      src: string;
      alt?: string;
      size?: number;
    }> = [];

    // 1. Suche nach <img> Tags mit URLs
    const imgUrlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgUrlRegex.exec(email.html)) !== null) {
      const src = match[1];
      const altMatch = match[0].match(/alt=["']([^"']+)["']/i);
      const alt = altMatch ? altMatch[1] : undefined;

      if (src.startsWith('http://') || src.startsWith('https://')) {
        images.push({ type: 'url', src, alt });
      } else if (src.startsWith('data:image/')) {
        // Base64 embedded image
        const base64Match = src.match(/data:image\/([^;]+);base64,(.+)/);
        if (base64Match) {
          const base64Data = base64Match[2];
          const size = Buffer.from(base64Data, 'base64').length;
          images.push({ type: 'base64', src, alt, size });
        }
      } else if (src.startsWith('cid:')) {
        // Content-ID (embedded attachment)
        images.push({ type: 'cid', src, alt });
      }
    }

    // 2. Suche nach CSS background-image URLs
    const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
    while ((match = bgImageRegex.exec(email.html)) !== null) {
      const src = match[1];
      if (src.startsWith('http://') || src.startsWith('https://')) {
        images.push({ type: 'url', src });
      }
    }

    if (images.length === 0) {
      this.logger.log('Keine Bilder im HTML gefunden');
      return;
    }

    this.logger.log(`🖼️ ${images.length} Bild(er) im HTML gefunden:`);

    for (const [index, image] of images.entries()) {
      this.logger.log(`───────────────────────────────────────────────────────`);
      this.logger.log(`Bild ${index + 1}:`);
      this.logger.log(`  Typ: ${image.type.toUpperCase()}`);

      if (image.type === 'url') {
        this.logger.log(`  URL: ${image.src}`);
        if (image.alt) {
          this.logger.log(`  Alt-Text: ${image.alt}`);
        }
        
        try {
          // Lade das externe Bild herunter
          this.logger.log(`  ⬇️ Lade Bild herunter...`);
          const imageBuffer = await this.downloadImage(image.src);
          
          if (imageBuffer) {
            // Bestimme Content-Type aus URL oder Header
            const contentType = this.getContentTypeFromUrl(image.src) || 'image/jpeg';
            const filename = this.getFilenameFromUrl(image.src) || `email-image-${index + 1}.jpg`;
            
            // Speichere das Bild
            const imageUrl = await this.imageService.uploadImageFromBuffer(
              imageBuffer,
              contentType,
              filename,
            );
            
            this.logger.log(`  💾 Bild erfolgreich heruntergeladen und gespeichert:`);
            this.logger.log(`  📎 URL: ${imageUrl}`);
          } else {
            this.logger.warn(`  ⚠️ Bild konnte nicht heruntergeladen werden`);
          }
        } catch (error) {
          this.logger.error(`  ❌ Fehler beim Herunterladen des Bildes:`, error);
        }
      } else if (image.type === 'base64') {
        this.logger.log(`  Format: Base64 embedded image`);
        if (image.size) {
          this.logger.log(`  Größe: ${image.size} bytes (${(image.size / 1024).toFixed(2)} KB)`);
        }
        if (image.alt) {
          this.logger.log(`  Alt-Text: ${image.alt}`);
        }
        
        try {
          // Extrahiere Base64-Daten
          const base64Match = image.src.match(/data:image\/([^;]+);base64,(.+)/);
          if (base64Match) {
            const imageFormat = base64Match[1]; // z.B. 'jpeg', 'png', 'gif'
            const base64Data = base64Match[2];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            // Speichere das Bild
            const imageUrl = await this.imageService.uploadImageFromBuffer(
              imageBuffer,
              `image/${imageFormat}`,
              `email-image-${index + 1}.${imageFormat}`,
            );
            
            this.logger.log(`  💾 Bild erfolgreich gespeichert:`);
            this.logger.log(`  📎 URL: ${imageUrl}`);
          }
        } catch (error) {
          this.logger.error(`  ❌ Fehler beim Speichern des Base64-Bildes:`, error);
        }
      } else if (image.type === 'cid') {
        this.logger.log(`  Content-ID: ${image.src}`);
        if (image.alt) {
          this.logger.log(`  Alt-Text: ${image.alt}`);
        }
        this.logger.log(`  ℹ️ Dies ist eine embedded Attachment-Referenz`);
        this.logger.log(`  ℹ️ Wird bereits als Anhang verarbeitet`);
      }
    }
  }

  /**
   * Lädt ein Bild von einer URL herunter
   * 
   * @param url - Die URL des Bildes
   * @returns Buffer mit den Bilddaten oder null bei Fehler
   */
  private async downloadImage(url: string): Promise<Buffer | null> {
    try {
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
          timeout: 10000,
        });

        const contentType = directResponse.headers['content-type'];
        if (contentType?.startsWith('image/')) {
          this.logger.debug(`✅ Bild direkt geladen von ${url}`);
          return Buffer.from(directResponse.data, 'binary');
        } else {
          this.logger.warn(`⚠️ Kein Bild-Content-Type: ${contentType}`);
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
            timeout: 10000,
          });

          const contentType = response.headers['content-type'];
          if (contentType?.startsWith('image/')) {
            this.logger.debug(`✅ Bild erfolgreich geladen über Proxy`);
            return Buffer.from(response.data, 'binary');
          }
        } catch (err: any) {
          this.logger.debug(`❌ Fehler bei Proxy: ${err.message}`);
        }
      }

      this.logger.warn(`⚠️ Alle Download-Versuche fehlgeschlagen für ${url}`);
      return null;
    } catch (error: any) {
      this.logger.error(`Fehler beim Herunterladen des Bildes: ${error.message}`);
      return null;
    }
  }

  /**
   * Bestimmt den Content-Type aus einer URL
   */
  private getContentTypeFromUrl(url: string): string | null {
    const extension = url.split('.').pop()?.toLowerCase()?.split('?')[0];
    const typeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
    };
    return extension ? typeMap[extension] || null : null;
  }

  /**
   * Extrahiert den Dateinamen aus einer URL
   */
  private getFilenameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename && filename.includes('.') ? filename : null;
    } catch {
      // Falls URL-Parsing fehlschlägt, versuche einfache Extraktion
      const match = url.match(/\/([^\/\?]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico))(\?|$)/i);
      return match ? match[1] : null;
    }
  }

  /**
   * Extrahiert Events aus einer E-Mail und fügt sie in die Datenbank ein
   * 
   * Diese Funktion:
   * - Findet oder erstellt ein Profil für den Absender
   * - Extrahiert Event-Daten aus E-Mail-Text und Bildern
   * - Erstellt Events in der Datenbank
   * 
   * @param email - Die empfangene E-Mail
   */
  async extractAndCreateEventsFromEmail(email: ReceivedEmail): Promise<void> {
    try {
      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log('📅 EVENT-EXTRAKTION AUS E-MAIL');
      this.logger.log('═══════════════════════════════════════════════════════');

      // 1. Extrahiere E-Mail-Adresse des Absenders
      const senderEmail = this.extractEmailAddress(email.from);
      if (!senderEmail) {
        this.logger.warn('⚠️ Keine gültige E-Mail-Adresse im Absender gefunden');
        return;
      }

      this.logger.log(`📧 Absender-E-Mail: ${senderEmail}`);

      // 2. Finde oder erstelle Profil für Absender
      const profile = await this.profileService.findOrCreateProfileByEmail(
        senderEmail,
      );
      this.logger.log(`👤 Profil: ${profile.username} (ID: ${profile.userId})`);

      // 3. Sammle alle Bild-URLs aus der E-Mail
      const imageUrls: string[] = [];

      // Bilder aus Anhängen
      if (email.attachments) {
        const imageAttachments = email.attachments.filter(
          (att) => att.contentType?.startsWith('image/') && att.content,
        );
        for (const attachment of imageAttachments) {
          if (attachment.content) {
            try {
              const imageUrl = await this.imageService.uploadImageFromBuffer(
                attachment.content,
                attachment.contentType || 'image/jpeg',
                attachment.filename,
              );
              imageUrls.push(imageUrl);
              this.logger.log(`📎 Bild aus Anhang hochgeladen: ${imageUrl}`);
            } catch (error) {
              this.logger.error(`Fehler beim Hochladen des Anhangs:`, error);
            }
          }
        }
      }

      // Base64-Bilder aus HTML
      if (email.html) {
        const base64Images = this.extractBase64ImagesFromHtml(email.html);
        for (const [index, base64Data] of base64Images.entries()) {
          try {
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const imageUrl = await this.imageService.uploadImageFromBuffer(
              imageBuffer,
              'image/png', // Base64-Bilder sind meist PNG
              `email-image-${index + 1}.png`,
            );
            imageUrls.push(imageUrl);
            this.logger.log(`📎 Base64-Bild hochgeladen: ${imageUrl}`);
          } catch (error) {
            this.logger.error(`Fehler beim Hochladen des Base64-Bildes:`, error);
          }
        }
      }

      // 4. Extrahiere Event-Daten aus Text und Bildern
      const events: Partial<Event>[] = [];

      // Versuche Events aus Text zu extrahieren
      if (email.text || email.html) {
        const emailText = email.text || this.extractTextFromHtml(email.html || '');
        if (emailText && emailText.trim().length > 0) {
          try {
            this.logger.log('🤖 Extrahiere Events aus E-Mail-Text...');
            const textEvents = await this.chatGptService.generateEventsFromText(
              emailText,
            );
            events.push(...textEvents);
            this.logger.log(`✅ ${textEvents.length} Event(s) aus Text extrahiert`);
          } catch (error) {
            this.logger.error('Fehler bei der Text-Extraktion:', error);
          }
        }
      }

      // Versuche Events aus Bildern zu extrahieren
      for (const imageUrl of imageUrls) {
        try {
          this.logger.log(`🤖 Extrahiere Event aus Bild: ${imageUrl}`);
          const flyerEvent = await this.chatGptService.extractEventFromFlyer(
            imageUrl,
          );
          if (flyerEvent) {
            flyerEvent.imageUrl = imageUrl; // Setze die hochgeladene Bild-URL
            events.push(flyerEvent);
            this.logger.log(`✅ Event aus Bild extrahiert: ${flyerEvent.title || 'Unbekannt'}`);
          }
        } catch (error) {
          this.logger.error(`Fehler bei der Bild-Extraktion:`, error);
        }
      }

      if (events.length === 0) {
        this.logger.log('⚠️ Keine Events in der E-Mail gefunden');
        return;
      }

      // 5. Erstelle Events in der Datenbank
      this.logger.log(`📝 Erstelle ${events.length} Event(s) in der Datenbank...`);

      for (const [index, eventData] of events.entries()) {
        try {
          // Bereite Event-Daten vor
          const eventToCreate: Partial<Event> = {
            ...eventData,
            hostId: profile.userId || '',
            hostUsername: profile.username,
            hostImageUrl: profile.profileImageUrl,
            email: senderEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
            regenstrations: 0,
            registeredUserIds: [],
          };

          // Erstelle Event
          const createdEvent = await this.eventService.create(eventToCreate);
          this.logger.log(`✅ Event erstellt: ${createdEvent.title} (ID: ${createdEvent.id})`);

          // Füge Event zum Profil hinzu
          await this.profileService.addCreatedEvent(
            profile.userId || '',
            createdEvent.id,
          );
        } catch (error) {
          this.logger.error(`Fehler beim Erstellen des Events ${index + 1}:`, error);
        }
      }

      this.logger.log('═══════════════════════════════════════════════════════');
      this.logger.log(`✅ Event-Extraktion abgeschlossen: ${events.length} Event(s) erstellt`);
      this.logger.log('═══════════════════════════════════════════════════════');
    } catch (error) {
      this.logger.error('Fehler bei der Event-Extraktion aus E-Mail:', error);
    }
  }

  /**
   * Extrahiert die E-Mail-Adresse aus einem String (z.B. "Name <email@example.com>")
   */
  private extractEmailAddress(from: string): string | null {
    // Versuche E-Mail-Adresse zu extrahieren
    const emailMatch = from.match(/<([^>]+)>/) || from.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return emailMatch ? emailMatch[1] : null;
  }

  /**
   * Extrahiert Text aus HTML (ohne Tags)
   */
  private extractTextFromHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrahiert Base64-Bilddaten aus HTML
   */
  private extractBase64ImagesFromHtml(html: string): string[] {
    const base64Images: string[] = [];
    const base64Regex = /data:image\/[^;]+;base64,([^"'\s]+)/gi;
    let match;

    while ((match = base64Regex.exec(html)) !== null) {
      base64Images.push(match[1]);
    }

    return base64Images;
  }
}
