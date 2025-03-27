import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ProfileService } from 'src/application/services/profile.service';

@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  constructor(private profileService: ProfileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // vom JwtAuthGuard gesetzter User
    const profileId = request.params.id;
    // Prüfe ob der User eingeloggt ist
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Hole das Profil
    const profile = await this.profileService.getProfile(profileId);

    // Prüfe ob das Profil existiert und dem User gehört
    if (!profile || profile.userId !== user.sub) {
      throw new ForbiddenException('Not authorized to edit this profile');
    }

    return true;
  }
}
