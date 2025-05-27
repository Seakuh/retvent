import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly emailService: EmailService) {}

  async sendEmail(email: string, subject: string, message: string) {
    await this.emailService.sendEmail(email, subject, message);
  }
}
