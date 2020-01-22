import { Controller, Post, Body, ValidationPipe, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { AmnesiaDto } from './dto/amnesia.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { AuthResponseObject } from './ro/auth.ro';
import { UserResponseObject } from 'src/user/ro/user.ro';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<UserResponseObject> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  signIn(
    @Body(ValidationPipe) credentialsDto: CredentialsDto,
  ): Promise<AuthResponseObject> {
    return this.authService.login(credentialsDto);
  }

  @Post('amnesia')
  amnesia(@Body(ValidationPipe) amnesiaDto: AmnesiaDto) {
    return this.authService.amnesia(amnesiaDto);
  }

  @Post('resend-confirmation-mail')
  resendConfirmationMail(@Body('email') email) {
    return this.authService.resendConfirmationMail(email);
  }

  @Post('change-password')
  changePassword(@Body(ValidationPipe) newPasswordDto: NewPasswordDto) {
    return this.authService.changePassword(newPasswordDto);
  }
}
