import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OTP } from 'otplib';
import * as toDataURL from 'qrcode';
import { User, UserStatus } from '../users/user.entity';

const otp = new OTP({ strategy: 'totp' });
import { RefreshToken } from './refresh-token.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  isTwoFactorAuthenticated?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private getAccessToken(payload: JwtPayload): string {
    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_TOKEN_TTL') || '900s';
    return this.jwtService.sign(
      payload as any,
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn,
      } as any,
    );
  }

  private async createRefreshToken(
    user: User,
    device?: string,
    ipAddress?: string,
  ) {
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_TOKEN_TTL') || '7d';
    const expiresAt = new Date(Date.now() + this.parseDurationToMs(expiresIn));

    const rawToken = this.jwtService.sign(
      { sub: user.id, email: user.email } as any,
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn,
      } as any,
    );

    const tokenHash = await bcrypt.hash(rawToken, 10);

    const entity = this.refreshTokenRepository.create({
      user,
      tokenHash,
      device,
      ipAddress,
      expiresAt,
    });
    await this.refreshTokenRepository.save(entity);

    return rawToken;
  }

  async login(user: User, device?: string, ipAddress?: string) {
    if (user.isTwoFactorEnabled) {
      return {
        isTwoFactorRequired: true,
        userId: user.id,
        // We could also return a temporary token here if we want to be more secure
      };
    }

    return this.generateTokens(user, device, ipAddress);
  }

  async generateTokens(
    user: User,
    device?: string,
    ipAddress?: string,
    is2faAuthenticated = false,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isTwoFactorAuthenticated: is2faAuthenticated,
    };
    const accessToken = this.getAccessToken(payload);
    const refreshToken = await this.createRefreshToken(user, device, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async generate2FASecret(user: User) {
    const secret = otp.generateSecret();
    const otpauthUrl = otp.generateURI({
      issuer: 'Ikoraniro',
      label: user.email,
      secret,
    });
    const qrCodeUrl = await toDataURL.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeUrl,
    };
  }

  async verifyTwoFactorCode(user: User, code: string) {
    if (!user.twoFactorSecret) return false;
    const result = await otp.verify({
      token: code,
      secret: user.twoFactorSecret,
    });
    return result.valid;
  }

  async verifyCode(secret: string, code: string) {
    const result = await otp.verify({
      token: code,
      secret,
    });
    return result.valid;
  }

  async turnOnTwoFactor(userId: string, secret: string) {
    return this.usersService.update(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    });
  }

  async validateSocialUser(socialData: {
    email: string;
    googleId?: string;
    githubId?: string;
    firstName: string;
    lastName: string;
  }) {
    let user = await this.usersService.findByEmail(socialData.email);

    if (user) {
      if (socialData.googleId && !user.googleId) {
        user = await this.usersService.update(user.id, {
          googleId: socialData.googleId,
        });
      }
      if (socialData.githubId && !user.githubId) {
        user = await this.usersService.update(user.id, {
          githubId: socialData.githubId,
        });
      }
    } else {
      user = await this.usersService.createSocialUser({
        email: socialData.email,
        googleId: socialData.googleId,
        githubId: socialData.githubId,
        firstName: socialData.firstName,
        lastName: socialData.lastName,
      });
    }

    return user;
  }

  async authenticateTwoFactor(
    userId: string,
    code: string,
    device?: string,
    ipAddress?: string,
  ) {
    const user = await this.usersService.findById(userId);
    const isValid = await this.verifyTwoFactorCode(user, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    return this.generateTokens(user, device, ipAddress, true);
  }

  async refresh(refreshToken: string) {
    const decoded = await this.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findById(decoded.sub);
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User is not active');
    }

    const tokenEntities = await this.refreshTokenRepository.find({
      where: { user: { id: user.id }, revoked: false },
    });

    const isValidStored = await this.isRefreshTokenStored(
      tokenEntities,
      refreshToken,
    );
    if (!isValidStored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.revokeAllUserTokens(user.id);

    return this.login(user);
  }

  async logout(userId: string) {
    await this.revokeAllUserTokens(userId);
  }

  private async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.update(
      {
        user: { id: userId },
        revoked: false,
      },
      { revoked: true },
    );
  }

  private async isRefreshTokenStored(
    entities: RefreshToken[],
    rawToken: string,
  ): Promise<boolean> {
    for (const entity of entities) {
      const matches = await bcrypt.compare(rawToken, entity.tokenHash);
      if (matches && !entity.revoked && entity.expiresAt > new Date()) {
        return true;
      }
    }
    return false;
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private parseDurationToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
      default:
        return amount * 24 * 60 * 60 * 1000;
    }
  }
}
