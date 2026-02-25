import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findOneByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async getOrCreateForUser(user: User): Promise<Profile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (!profile) {
      profile = this.profileRepository.create({ user });
      await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateByUserId(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  /** Rough completeness for "profile must be 50% complete to apply" rule */
  completenessPercent(profile: Profile, user: User): number {
    let filled = 0;
    const checks = [
      !!user.firstName,
      !!user.lastName,
      !!profile.headline,
      !!profile.bio,
      (profile.workExperience?.length ?? 0) > 0,
      (profile.skills?.length ?? 0) > 0,
      !!profile.resumeUrl,
      !!profile.city || !!profile.country,
    ];
    filled = checks.filter(Boolean).length;
    return Math.min(100, Math.round((filled / checks.length) * 100));
  }
}
