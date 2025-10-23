import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { User } from '../../core/domain/user';
import { BcryptService } from '../../core/services/bcrypt.service';
import { User as UserDecorator } from '../decorators/user.decorator';
import { EventPageDto } from '../dtos/event-page.dto';
import { ProfileInfoDto } from '../dtos/profile.dto';
import { UpdateUserProfileDto } from '../dtos/update-user.dto';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@UserDecorator() user: User) {
    const currentUser = await this.userService.findById(user.id);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = currentUser;
    return userWithoutPassword;
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserProfile(
    @UserDecorator() user: User,
  ): Promise<UserProfileDto> {
    return (await this.userService.getUserProfile(user.sub)) as UserProfileDto;
  }

  @Get('me/points')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserPoints(@UserDecorator() user: User) {
    return this.userService.getUserPoints(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUser(
    @UserDecorator() user: User,
    @Body() updateUserDto: UpdateUserProfileDto,
  ) {
    console.log('user', user);
    console.log('user.id', user.id);
    console.log('user.sub', user.sub);
    const currentUser = await this.userService.findById(user.sub);
    if (!currentUser) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // Wenn E-Mail oder Benutzername geändert werden soll, prüfe ob diese bereits existieren
    if (updateUserDto.email && updateUserDto.email !== currentUser.email) {
      const existingUser = await this.userService.findByEmail(
        updateUserDto.email,
      );
      if (existingUser) {
        throw new ForbiddenException('This email is already in use');
      }
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== currentUser.username
    ) {
      const existingUser = await this.userService.findByEmailOrUsername(
        '',
        updateUserDto.username,
      );
      if (existingUser) {
        throw new ForbiddenException('This username is already in use');
      }
    }

    // Wenn das Passwort geändert werden soll, hashe es
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      );
    }

    const updatedUser = await this.userService.update(user.id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('Benutzer konnte nicht aktualisiert werden');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ProfileInfoDto> {
    return this.userService.getProfileInfo(id);
  }

  @Get('points/:id')
  async getUserPoints(@Param('id') id: string) {
    return this.userService.getUserPoints(id);
  }

  @Delete('/favorites/:id')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    return this.userService.removeFavorite(userId, id);
  }

  @Post('/favorites/:id')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    return this.userService.addFavorite(userId, id);
  }

  @Put('/favorites')
  @UseGuards(JwtAuthGuard)
  updateFavorites(@Body() favoriteEventIds: string[], @Req() req) {
    const userId = req.user.sub;
    return this.userService.updateFavorites(userId, favoriteEventIds);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(@UserDecorator() user: User) {
    console.log(user);
    return this.userService.getFavorites(user.sub);
  }

  @Get('me/eventPage')
  @UseGuards(JwtAuthGuard)
  async getUserEventPage(@UserDecorator() user: User): Promise<EventPageDto> {
    console.log(user);
    return this.userService.getUserEventPage(user.sub);
  }

  @Get('me/followedProfiles')
  @UseGuards(JwtAuthGuard)
  async getFollowedProfiles(@UserDecorator() user: User) {
    return this.userService.getFollowedProfiles(user.sub);
  }

  @Post('me/followedProfiles/:id')
  @UseGuards(JwtAuthGuard)
  async addFollowedProfile(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    return this.userService.addFollowedProfile(userId, id);
  }

  @Delete('me/followedProfiles/:id')
  @UseGuards(JwtAuthGuard)
  async removeFollowedProfile(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    return this.userService.removeFollowedProfile(userId, id);
  }

  // @Get('profile/:id')
  // async getUserProfile(@Param('id') id: string): Promise<User> {
  //   const user = await this.userService.findById(id);
  //   if (!user) {
  //     throw new NotFoundException('Benutzer nicht gefunden');
  //   }

  //   // Hier können weitere Profilinformationen geladen werden
  //   const userProfile = await this.userService.getUserProfileData(id);

  //   // Passwort aus der Antwort entfernen
  //   const { password, ...userWithoutPassword } = user;

  //   // Benutzerdaten mit Profilinformationen zusammenführen
  //   return {
  //     ...userWithoutPassword,
  //     profile: userProfile,
  //   };
  // }

  // // Comment
  // @Post('comment')
  // @UseGuards(JwtAuthGuard)
  // async createComment(@UserDecorator() user: User, @Body() comment: Comment) {
  //   return this.userService.createComment(user.id, comment);
  // }

  // ------------------------------------------------------------
  // Register Event
  // ------------------------------------------------------------
  @Post('registe/event')
  @UseGuards(JwtAuthGuard)
  async registerEvent(@Body() body: { eventId: string }, @Req() req) {
    return this.userService.registerForEvent(body.eventId, req.user.id);
  }

  @Get('registered/events')
  @UseGuards(JwtAuthGuard)
  async getRegisteredEvents(@Req() req) {
    return this.userService.getRegisteredEvents(req.user.sub);
  }
}
