import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileDocumentsService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    type: 'resume' | 'cover_letter',
  ): Promise<{ url: string }> {
    if (!file?.path) {
      throw new BadRequestException('No file uploaded or upload failed');
    }

    const url = file.path; // Cloudinary URL is in file.path with multer-storage-cloudinary

    if (type === 'resume') {
      const profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (profile) {
        profile.resumeUrl = url;
        await this.profileRepository.save(profile);
      }
    }

    return { url };
  }
}
