import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../shared/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresIn);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresIn);
    return { accessToken: result.accessToken, user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: CurrentUserData) {
    return user;
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = dto.refreshToken ?? this.getRefreshCookie(req);
    if (!token) {
      return { accessToken: null };
    }
    const result = await this.authService.refreshToken(token);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresIn);
    return { accessToken: result.accessToken, user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(
    @CurrentUser() user: CurrentUserData,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.id);
    this.clearRefreshCookie(res);
    return result;
  }

  private setRefreshCookie(res: Response, token: string, ttlSeconds: number) {
    const name = process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token';
    res.cookie(name, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ttlSeconds * 1000,
      path: '/',
    });
  }

  private clearRefreshCookie(res: Response) {
    const name = process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token';
    res.clearCookie(name, { path: '/' });
  }

  private getRefreshCookie(req: Request) {
    const name = process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token';
    const cookies = req.cookies as
      | Record<string, string | undefined>
      | undefined;
    return cookies?.[name];
  }
}
