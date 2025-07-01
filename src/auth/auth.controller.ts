import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'generated/prisma/runtime/library';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.Register(registerDto);
  }

  @Post('login')
  Login(@Body() loginDto: LoginDto) {
    return this.authService.Login(loginDto);
  }
}
