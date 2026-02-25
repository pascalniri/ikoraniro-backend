import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfileDocumentsService } from './profile-documents.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), UsersModule],
  providers: [ProfilesService, ProfileDocumentsService],
  controllers: [ProfilesController],
  exports: [ProfilesService, TypeOrmModule],
})
export class ProfilesModule {}
