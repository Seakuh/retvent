import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

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
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

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
    } catch (error) {
      this.logger.error('Fehler beim Loggen der empfangenen E-Mail:', error);
      throw error;
    }
  }
}
