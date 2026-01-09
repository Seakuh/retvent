import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMTPServer, SMTPServerOptions } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import { MailService, ReceivedEmail } from '../../application/services/mail.service';

/**
 * SMTP-Server-Service zum Empfangen von E-Mails
 * 
 * Dieser Service startet einen SMTP-Server, der eingehende E-Mails empfängt,
 * parst und an den MailService zur weiteren Verarbeitung weiterleitet.
 * 
 * Konfiguration über Umgebungsvariablen:
 * - SMTP_PORT: Port für den SMTP-Server (Standard: 2525)
 * - SMTP_HOST: Hostname/IP für den SMTP-Server (Standard: 0.0.0.0)
 * - SMTP_AUTH_REQUIRED: Ob Authentifizierung erforderlich ist (Standard: false)
 */
@Injectable()
export class SMTPServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SMTPServerService.name);
  private smtpServer: SMTPServer | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Startet den SMTP-Server beim Modul-Start
   */
  async onModuleInit() {
    const portConfig = this.configService.get<string | number>('SMTP_PORT', 2525);
    const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
    const host = this.configService.get<string>('SMTP_HOST', '0.0.0.0');
    const authRequired = this.configService.get<boolean>('SMTP_AUTH_REQUIRED', false);

    const options: SMTPServerOptions = {
      // Server-Konfiguration
      name: 'Retvent Mail Server',
      banner: 'Retvent SMTP Server ready',
      
      // Host und Port
      host,
      
      // Authentifizierung (optional)
      authMethods: authRequired ? ['PLAIN', 'LOGIN'] : [],
      onAuth: authRequired
        ? async (auth, session, callback) => {
            // Einfache Authentifizierung - kann erweitert werden
            const username = this.configService.get<string>('SMTP_USERNAME');
            const password = this.configService.get<string>('SMTP_PASSWORD');
            
            if (auth.username === username && auth.password === password) {
              callback(null, { user: auth.username });
            } else {
              callback(new Error('Invalid credentials'));
            }
          }
        : undefined,

      // E-Mail-Empfang
      onData: async (stream, session, callback) => {
        try {
          // Parse die eingehende E-Mail
          const parsed: ParsedMail = await simpleParser(stream);

          // Konvertiere zu ReceivedEmail-Format
          const email: ReceivedEmail = {
            from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'unknown',
            to: parsed.to
              ? Array.isArray(parsed.to.value)
                ? parsed.to.value.map((addr) => addr.address).join(', ')
                : parsed.to.text || parsed.to.value?.address || 'unknown'
              : 'unknown',
            subject: parsed.subject || '',
            text: parsed.text || undefined,
            html: parsed.html || undefined,
            date: parsed.date || new Date(),
            headers: this.parseHeaders(parsed.headers),
            attachments: parsed.attachments?.map((att) => ({
              filename: att.filename || 'unnamed',
              contentType: att.contentType || 'application/octet-stream',
              size: att.size || 0,
            })),
          };

          // Leite die E-Mail an den MailService weiter
          await this.mailService.receiveEmail(email);

          // Bestätige den Empfang
          callback(null);
        } catch (error) {
          this.logger.error('Fehler beim Verarbeiten der eingehenden E-Mail:', error);
          callback(error);
        }
      },

      // Logging
      onConnect: (session, callback) => {
        this.logger.log(`SMTP-Verbindung von ${session.remoteAddress}`);
        callback();
      },

      onMailFrom: (address, session, callback) => {
        this.logger.debug(`MAIL FROM: ${address.address}`);
        callback();
      },

      onRcptTo: (address, session, callback) => {
        this.logger.debug(`RCPT TO: ${address.address}`);
        callback();
      },

      // Fehlerbehandlung
      onError: (error) => {
        this.logger.error('SMTP-Server Fehler:', error);
      },
    };

    // Erstelle und starte den SMTP-Server
    this.smtpServer = new SMTPServer(options);

    this.smtpServer.listen(port, host, () => {
      this.logger.log(`═══════════════════════════════════════════════════════`);
      this.logger.log(`📬 SMTP-Server gestartet`);
      this.logger.log(`   Host: ${host}`);
      this.logger.log(`   Port: ${port}`);
      this.logger.log(`   Authentifizierung: ${authRequired ? 'Erforderlich' : 'Deaktiviert'}`);
      this.logger.log(`═══════════════════════════════════════════════════════`);
    });

    this.smtpServer.on('error', (error) => {
      this.logger.error('SMTP-Server Fehler:', error);
    });
  }

  /**
   * Stoppt den SMTP-Server beim Modul-Shutdown
   */
  async onModuleDestroy() {
    if (this.smtpServer) {
      this.smtpServer.close(() => {
        this.logger.log('SMTP-Server gestoppt');
      });
    }
  }

  /**
   * Konvertiert Mailparser-Header zu einem einfachen Objekt
   */
  private parseHeaders(headers: Map<string, any> | any): Record<string, string> {
    const result: Record<string, string> = {};

    if (headers instanceof Map) {
      headers.forEach((value, key) => {
        result[key] = Array.isArray(value) ? value.join(', ') : String(value);
      });
    } else if (typeof headers === 'object' && headers !== null) {
      Object.entries(headers).forEach(([key, value]) => {
        result[key] = Array.isArray(value) ? value.join(', ') : String(value);
      });
    }

    return result;
  }
}

