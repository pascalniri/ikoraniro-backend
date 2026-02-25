import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserStatus } from '../users/user.entity';
import { TwoFactorDto } from './dto/two-factor.dto';
import { TwoFactorAuthenticateDto } from './dto/two-factor-authenticate.dto';
import { UnauthorizedException, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    // In a real implementation we would send an email with a verification token.
    // For now, we activate the user immediately to keep the flow simple.
    await this.usersService.setStatus(user.id, UserStatus.ACTIVE);
    const activeUser = await this.usersService.findById(user.id);
    return this.authService.login(activeUser);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    // We call the service directly instead of using the passport guard
    // to keep the flow simple and explicit.
    const user = await this.authService.validateUser(dto.email, dto.password);
    const device = req.headers['user-agent'] as string | undefined;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ??
      req.socket.remoteAddress ??
      undefined;

    return this.authService.login(user, device, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.userId);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async generate2fa(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return this.authService.generate2FASecret(user);
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Turn on 2FA' })
  async turnOn2fa(
    @Req() req: any,
    @Body() { code, secret }: { code: string; secret: string },
  ) {
    const isValid = await this.authService.verifyCode(secret, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    await this.authService.turnOnTwoFactor(req.user.userId, secret);
  }

  @Post('2fa/authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with 2FA code during login' })
  async authenticate2fa(
    @Body() { userId, code }: TwoFactorAuthenticateDto,
    @Req() req: Request,
  ) {
    const device = req.headers['user-agent'] as string | undefined;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ??
      req.socket.remoteAddress ??
      undefined;

    return this.authService.authenticateTwoFactor(userId, code, device, ip);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() _req: any) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google login callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const user = await this.authService.validateSocialUser(req.user);
    const result = await this.authService.login(user);

    // In a real app, we would redirect to the frontend with tokens or set a cookie.
    // For this example, we'll return the result as JSON.
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Login with GitHub' })
  async githubAuth(@Req() _req: any) {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub login callback' })
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const user = await this.authService.validateSocialUser(req.user);
    const result = await this.authService.login(user);

    return res.status(HttpStatus.OK).json(result);
  }
}
