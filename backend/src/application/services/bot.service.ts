import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGPTService } from 'src/infrastructure/services/chatgpt.service';
import { CommentService } from './comment.service';
import { EventService } from './event.service';
@Injectable()
export class BotService {
  constructor(
    private readonly eventService: EventService,
    private readonly commentService: CommentService,
    private readonly chatgptService: ChatGPTService,
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

  @Cron(CronExpression.EVERY_10_HOURS)
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
}
