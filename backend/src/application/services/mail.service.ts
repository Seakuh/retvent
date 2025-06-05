import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { registerTemplate } from '../templates/emails/register';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async getTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'application',
      'templates',
      'emails',
      `${templateName}.hbs`,
    );
    console.log('Template path:', templatePath);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template;
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  async sendRegisterEmail(to: string, subject: string, username: string) {
    console.log('### Send Register Email ###', to, subject, username);
    const html = registerTemplate;

    const result = await this.mailerService.sendMail({
      to,
      subject,
      html,
      text: `🎉🎉🎉 Welcome ${username}, Let's discover the world of events with Event Scanner`,
    });

    console.log('### Mail Result ###', result);
  }
}
