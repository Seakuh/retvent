import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../infrastructure/services/auth.service';
import { LoginDto, LoginV2Dto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
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

  @Post('v2/register')
  async registerV2(@Body() registerDto: RegisterUserDto) {
    try {
      return await this.authService.registerWithProfile(registerDto);
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

  @Post('v2/login')
  async loginV2(@Body() loginDto: LoginV2Dto) {
    try {
      return await this.authService.loginV2(loginDto);
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
