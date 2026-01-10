import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { MailService, ReceivedEmail } from '../../application/services/mail.service';

/**
 * IMAP-Mail-Service zum Abrufen von E-Mails vom Mailserver
 * 
 * Dieser Service verbindet sich regelmäßig per IMAP zum Mailserver und
 * ruft neue E-Mails ab. Perfekt für Shared Hosting wie All-Inkl, wo
 * kein SMTP-Server betrieben werden kann.
 * 
 * Konfiguration über Umgebungsvariablen:
 * - IMAP_HOST: IMAP-Server Hostname (z.B. imap.kasserver.com)
 * - IMAP_PORT: IMAP-Port (Standard: 993 für SSL, 143 für unverschlüsselt)
 * - IMAP_USER: Benutzername für IMAP
 * - IMAP_PASSWORD: Passwort für IMAP
 * - IMAP_TLS: Ob TLS verwendet werden soll (Standard: true)
 * - IMAP_INBOX: Postfach-Name (Standard: 'INBOX')
 * - IMAP_POLL_INTERVAL: Abruf-Intervall in Sekunden (Standard: 60)
 */
@Injectable()
export class IMAPMailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IMAPMailService.name);
  private imap: Imap | null = null;
  private isConnected = false;
  private processedUids = new Set<number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.logger.log('🔧 IMAPMailService wird konstruiert...');
  }

  /**
   * Initialisiert die IMAP-Verbindung beim Modul-Start
   */
  async onModuleInit() {
    this.logger.log('🔄 Initialisiere IMAP-Mail-Service...');
    
    const host = this.configService.get<string>('IMAP_HOST');
    const user = this.configService.get<string>('IMAP_USER');
    const password = this.configService.get<string>('IMAP_PASSWORD');

    if (!host || !user || !password) {
      this.logger.warn('⚠️ IMAP-Konfiguration unvollständig. IMAP-Mail-Service wird nicht gestartet.');
      this.logger.warn('   Benötigte Variablen: IMAP_HOST, IMAP_USER, IMAP_PASSWORD');
      this.logger.warn(`   Aktuelle Werte: HOST=${host ? 'gesetzt' : 'FEHLT'}, USER=${user ? 'gesetzt' : 'FEHLT'}, PASS=${password ? 'gesetzt' : 'FEHLT'}`);
      return;
    }

    this.logger.log(`📋 Konfiguration: HOST=${host}, USER=${user}, PORT=${this.configService.get<number>('IMAP_PORT', 993)}`);

    try {
      await this.connect();
      
      // Starte sofort einen ersten Abruf
      setTimeout(() => this.fetchNewEmails(), 5000);
    } catch (error) {
      this.logger.error('❌ Fehler beim Initialisieren der IMAP-Verbindung:', error);
      this.logger.log('🔄 Versuche Verbindung in 30 Sekunden erneut...');
      
      // Versuche nach 30 Sekunden erneut zu verbinden
      setTimeout(() => {
        this.reconnect();
      }, 30000);
    }
  }

  /**
   * Verbindet sich zum IMAP-Server
   */
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const host = this.configService.get<string>('IMAP_HOST');
      const port = this.configService.get<number>('IMAP_PORT', 993);
      const user = this.configService.get<string>('IMAP_USER');
      const password = this.configService.get<string>('IMAP_PASSWORD');
      const tls = this.configService.get<boolean>('IMAP_TLS', true);

      this.logger.log(`📡 Verbinde zu IMAP-Server: ${host}:${port} (TLS: ${tls})`);

      this.imap = new Imap({
        user,
        password,
        host,
        port,
        tls,
        tlsOptions: { rejectUnauthorized: false },
      });

      // Timeout für Verbindungsaufbau (30 Sekunden)
      const timeout = setTimeout(() => {
        if (!this.isConnected) {
          this.logger.error('❌ IMAP-Verbindungs-Timeout nach 30 Sekunden');
          this.imap?.end();
          reject(new Error('IMAP connection timeout'));
        }
      }, 30000);

      this.imap.once('ready', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.logger.log('✅ IMAP-Verbindung erfolgreich hergestellt');
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        clearTimeout(timeout);
        this.isConnected = false;
        this.logger.error('❌ IMAP-Verbindungsfehler:', err);
        this.logger.error(`   Fehlerdetails: ${err.message}`);
        if (err.stack) {
          this.logger.error(`   Stack: ${err.stack}`);
        }
        reject(err);
      });

      this.imap.once('end', () => {
        this.isConnected = false;
        this.logger.log('🔌 IMAP-Verbindung beendet');
      });

      this.imap.connect();
    });
  }

  /**
   * Versucht die Verbindung erneut herzustellen
   */
  private async reconnect() {
    this.logger.log('🔄 Versuche IMAP-Verbindung wiederherzustellen...');
    try {
      await this.connect();
      this.logger.log('✅ Verbindung erfolgreich wiederhergestellt');
    } catch (error) {
      this.logger.error('❌ Wiederherstellung fehlgeschlagen:', error);
      this.logger.log('🔄 Versuche erneut in 60 Sekunden...');
      setTimeout(() => {
        this.reconnect();
      }, 60000);
    }
  }

  /**
   * Ruft neue E-Mails vom Server ab
   * Wird regelmäßig per Cron-Job aufgerufen
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async fetchNewEmails() {
    if (!this.isConnected || !this.imap) {
      this.logger.debug('IMAP nicht verbunden, überspringe Abruf');
      // Versuche Verbindung wiederherzustellen
      if (!this.imap) {
        this.reconnect();
      }
      return;
    }

    try {
      const inbox = this.configService.get<string>('IMAP_INBOX', 'INBOX');
      
      this.imap.openBox(inbox, false, (err, box) => {
        if (err) {
          this.logger.error('Fehler beim Öffnen des Postfachs:', err);
          return;
        }

        // Suche nach ungelesenen E-Mails
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            this.logger.error('Fehler bei der E-Mail-Suche:', err);
            return;
          }

          if (!results || results.length === 0) {
            this.logger.debug('Keine neuen E-Mails gefunden');
            return;
          }

          this.logger.log(`📬 ${results.length} neue E-Mail(s) gefunden`);

          // Filtere bereits verarbeitete UIDs
          const newUids = results.filter((uid) => !this.processedUids.has(uid));
          
          if (newUids.length === 0) {
            this.logger.debug('Alle E-Mails wurden bereits verarbeitet');
            return;
          }

          // Lade die E-Mails
          const fetch = this.imap.fetch(newUids, {
            bodies: '',
            struct: true,
          });

          fetch.on('message', (msg, seqno) => {
            let emailBuffer = Buffer.alloc(0);

            msg.on('body', (stream) => {
              stream.on('data', (chunk: Buffer) => {
                emailBuffer = Buffer.concat([emailBuffer, chunk]);
              });
            });

            msg.once('end', async () => {
              try {
                const parsed: ParsedMail = await simpleParser(emailBuffer);

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

                // Markiere als verarbeitet
                const uid = newUids[seqno - 1];
                this.processedUids.add(uid);

                this.logger.log(`✅ E-Mail verarbeitet: ${email.subject} (UID: ${uid})`);
              } catch (error) {
                this.logger.error('Fehler beim Verarbeiten der E-Mail:', error);
              }
            });
          });

          fetch.once('error', (err) => {
            this.logger.error('Fehler beim Abrufen der E-Mails:', err);
          });

          fetch.once('end', () => {
            this.logger.log('E-Mail-Abruf abgeschlossen');
          });
        });
      });
    } catch (error) {
      this.logger.error('Fehler beim Abrufen neuer E-Mails:', error);
    }
  }

  /**
   * Trennt die IMAP-Verbindung beim Modul-Shutdown
   */
  async onModuleDestroy() {
    if (this.imap && this.isConnected) {
      this.imap.end();
      this.logger.log('IMAP-Verbindung getrennt');
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

