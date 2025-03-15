import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { LocationService } from '../../application/services/location.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly locationService: LocationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const locationId = request.params.id;
    const userId = request.user.id;

    const location = await this.locationService.findById(locationId);
    if (!location) {
      return false;
    }

    return location.ownerId === userId;
  }
}
