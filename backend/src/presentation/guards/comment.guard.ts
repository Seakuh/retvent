import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OptionalJwtAuthGuard } from './jwt-optional-auth.guard';

@Injectable()
export class CommentGuard extends OptionalJwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Versuche den JWT Token zu validieren
    const result = await super.canActivate(context);

    // Wenn kein Token vorhanden ist oder ungültig ist, setze userId auf 'public'
    if (!request.user) {
      request.user = { id: 'public' };
    }

    return true;
  }
}
