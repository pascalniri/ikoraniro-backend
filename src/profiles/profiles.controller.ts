import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { ProfileDocumentsService } from './profile-documents.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly profileDocumentsService: ProfileDocumentsService,
    private readonly usersService: UsersService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  @Get()
  async getMyProfile(@Req() req: { user: { userId: string } }) {
    const user = await this.usersService.findById(req.user.userId);
    const profile = await this.profilesService.getOrCreateForUser(user);
    const completeness = this.profilesService.completenessPercent(
      profile,
      user,
    );
    return {
      ...profile,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      completenessPercent: completeness,
    };
  }

  @Patch()
  async updateMyProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateByUserId(req.user.userId, dto);
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: 'ikoraniro/documents',
          allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          resource_type: 'auto',
        } as any,
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Req() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'resume' | 'cover_letter',
  ) {
    if (!type || !['resume', 'cover_letter'].includes(type)) {
      throw new BadRequestException('type must be resume or cover_letter');
    }
    return this.profileDocumentsService.uploadDocument(
      req.user.userId,
      file,
      type,
    );
  }
}
