import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { SendRequestToChangePasswordDto } from './dto/sendRequestToChangePassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.login(loginDto, req, res);
  }

  @Post('/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Get('/refresh')
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshTokens(req, res);
  }

  @Post('/verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.verifyEmail(verifyEmailDto, req, res);
  }

  @Post('/send-change-password-request')
  sendChangePasswordRequest(@Body() dto: SendRequestToChangePasswordDto) {
    return this.authService.sendRequestTochangePassword(dto);
  }

  @Post('/change-password')
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request, @Res() res: Response) {
    return this.authService.getProfile(req, res);
  }
}
