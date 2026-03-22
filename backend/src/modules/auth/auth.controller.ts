import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService, AuthTokens } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthTokens> {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.nickname,
    );
    return this.authService.login(user);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  async logout(@Request() req): Promise<void> {
    await this.authService.logout(req.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string): Promise<{ success: boolean }> {
    const result = await this.authService.requestPasswordReset(email);
    return { success: result };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ): Promise<{ success: boolean }> {
    const result = await this.authService.resetPassword(token, password);
    return { success: result };
  }

  @Post('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Request() req, @Res() res: Response): Promise<void> {
    if (!req.user) {
      throw new BadRequestException('Authentication failed');
    }
    const tokens = await this.authService.login(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?tokens=${JSON.stringify(tokens)}`);
  }

  @Post('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Request() req, @Res() res: Response): Promise<void> {
    if (!req.user) {
      throw new BadRequestException('Authentication failed');
    }
    const tokens = await this.authService.login(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?tokens=${JSON.stringify(tokens)}`);
  }
}
