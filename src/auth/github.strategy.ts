import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID:
        configService.get<string>('GITHUB_CLIENT_ID') ||
        'MISSING_GITHUB_CLIENT_ID',
      clientSecret:
        configService.get<string>('GITHUB_CLIENT_SECRET') ||
        'MISSING_GITHUB_CLIENT_SECRET',
      callbackURL: `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, emails, displayName } = profile;
    const user = {
      githubId: id,
      email: emails?.[0]?.value || `${username}@github.com`,
      firstName: displayName || username,
      lastName: '',
    };
    done(null, user);
  }
}
