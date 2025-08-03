import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

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
}
