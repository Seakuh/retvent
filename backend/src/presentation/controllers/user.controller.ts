import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { User } from '../../core/domain/user';
import { BcryptService } from '../../core/services/bcrypt.service';
import { User as UserDecorator } from '../decorators/user.decorator';
import { ProfileInfoDto } from '../dtos/profile.dto';
import { UpdateUserDto } from '../dtos/update-user.dto.';
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
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = currentUser;
    return userWithoutPassword;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUser(
    @UserDecorator() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const currentUser = await this.userService.findById(user.id);
    if (!currentUser) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // Wenn E-Mail oder Benutzername geändert werden soll, prüfe ob diese bereits existieren
    if (updateUserDto.email && updateUserDto.email !== currentUser.email) {
      const existingUser = await this.userService.findByEmail(
        updateUserDto.email,
      );
      if (existingUser) {
        throw new ForbiddenException(
          'Diese E-Mail-Adresse wird bereits verwendet',
        );
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
        throw new ForbiddenException(
          'Dieser Benutzername wird bereits verwendet',
        );
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
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }
    return null;
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
}
