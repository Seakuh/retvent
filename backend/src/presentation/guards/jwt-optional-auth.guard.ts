import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err, user) {
    if (err || !user) {
      return null; // Keine Authentifizierung notwendig
    }
    return user; // Falls authentifiziert, nutze den User
  }
}
