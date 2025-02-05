import { Controller, Post, Body, BadRequestException, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../infrastructure/services/auth.service';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('Kein Token gefunden');
    }
    const token = auth.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Erfolgreich ausgeloggt' };
  }
} 