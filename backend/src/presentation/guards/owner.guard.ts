import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { LocationService } from '../../infrastructure/services/location.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private locationService: LocationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const locationId = request.params.id;

    if (!user || !locationId) {
      throw new ForbiddenException('Keine Berechtigung');
    }

    const location = await this.locationService.getLocationById(locationId);
    
    if (!location) {
      throw new ForbiddenException('Location nicht gefunden');
    }

    if (location.ownerId !== user.id) {
      throw new ForbiddenException('Keine Berechtigung für diese Location');
    }

    return true;
  }
} 