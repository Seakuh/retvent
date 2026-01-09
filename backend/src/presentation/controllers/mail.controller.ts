import { Body, Controller, Post, Req } from '@nestjs/common';
import { MailService, ReceivedEmail } from '../../application/services/mail.service';

/**
 * Controller für den Empfang von E-Mails über Webhooks
 * 
 * Dieser Controller stellt Endpoints bereit, um E-Mails von verschiedenen
 * Mail-Services (z.B. SendGrid, Mailgun, etc.) zu empfangen.
 * 
 * Aktuell werden alle empfangenen E-Mails nur geloggt.
 */
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * Webhook-Endpoint für den Empfang von E-Mails
   * 
   * Dieser Endpoint kann von verschiedenen Mail-Services aufgerufen werden:
   * - SendGrid Inbound Parse
   * - Mailgun Routes
   * - Postmark Inbound
   * - etc.
   * 
   * POST /mail/webhook
   * 
   * Die E-Mail-Daten können in verschiedenen Formaten kommen:
   * - JSON (von den meisten Services)
   * - Form-encoded (von einigen Services)
   * - Raw (als E-Mail-String)
   */
  @Post('webhook')
  async receiveEmailWebhook(
    @Req() req: any,
    @Body() body: any,
  ) {
    try {
      // Versuche verschiedene Formate zu parsen
      let email: ReceivedEmail;

      // Format 1: SendGrid Inbound Parse Format
      if (body.from && body.to && body.subject) {
        email = {
          from: body.from,
          to: body.to,
          subject: body.subject,
          text: body.text || body['text-plain'],
          html: body.html || body['text-html'],
          date: body.date ? new Date(body.date) : new Date(),
          headers: body.headers || {},
          attachments: body.attachments || [],
        };
      }
      // Format 2: Mailgun Format
      else if (body['sender'] && body['recipient']) {
        email = {
          from: body['sender'],
          to: body['recipient'],
          subject: body['subject'] || '',
          text: body['body-plain'] || body['body-text'],
          html: body['body-html'],
          date: body['Date'] ? new Date(body['Date']) : new Date(),
          headers: body['message-headers'] || {},
          attachments: body['attachment-count'] > 0 ? [] : undefined,
        };
      }
      // Format 3: Postmark Format
      else if (body['From'] && body['To']) {
        email = {
          from: body['From'],
          to: body['To'],
          subject: body['Subject'] || '',
          text: body['TextBody'],
          html: body['HtmlBody'],
          date: body['Date'] ? new Date(body['Date']) : new Date(),
          headers: body['Headers'] || {},
        };
      }
      // Format 4: Generisches Format (direkt als ReceivedEmail)
      else if (body.from && body.to) {
        email = body as ReceivedEmail;
      }
      // Format 5: Raw E-Mail-String (falls als Text gesendet)
      else if (req.rawBody && typeof req.rawBody === 'string') {
        // Einfaches Parsing für Raw-E-Mails
        const rawEmail = req.rawBody.toString();
        const fromMatch = rawEmail.match(/From:\s*(.+)/i);
        const toMatch = rawEmail.match(/To:\s*(.+)/i);
        const subjectMatch = rawEmail.match(/Subject:\s*(.+)/i);
        const dateMatch = rawEmail.match(/Date:\s*(.+)/i);
        
        // Trenne Header und Body
        const headerEnd = rawEmail.indexOf('\n\n');
        const headers = headerEnd > 0 ? rawEmail.substring(0, headerEnd) : rawEmail;
        const bodyText = headerEnd > 0 ? rawEmail.substring(headerEnd + 2) : '';
        
        email = {
          from: fromMatch ? fromMatch[1].trim() : 'unknown',
          to: toMatch ? toMatch[1].trim() : 'unknown',
          subject: subjectMatch ? subjectMatch[1].trim() : '',
          text: bodyText,
          date: dateMatch ? new Date(dateMatch[1].trim()) : new Date(),
          headers: { raw: headers },
        };
      }
      else {
        // Fallback: Logge den gesamten Body für Debugging
        email = {
          from: 'unknown',
          to: 'unknown',
          subject: 'Unbekanntes Format',
          text: JSON.stringify(body, null, 2),
          date: new Date(),
          headers: { 'content-type': req.headers['content-type'] || 'unknown' },
        };
      }

      // Verarbeite die E-Mail (aktuell nur Logging)
      await this.mailService.receiveEmail(email);

      return {
        success: true,
        message: 'E-Mail erfolgreich empfangen und geloggt',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test-Endpoint zum manuellen Testen des E-Mail-Empfangs
   * 
   * POST /mail/test
   * Body: ReceivedEmail-Objekt
   */
  @Post('test')
  async testReceiveEmail(@Body() email: ReceivedEmail) {
    await this.mailService.receiveEmail(email);
    return {
      success: true,
      message: 'Test-E-Mail erfolgreich geloggt',
    };
  }
}

