import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearch } from './saved-search.entity';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';
import { JobAlertsScheduler } from './job-alerts.scheduler';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSearch]), JobsModule],
  providers: [SavedSearchesService, JobAlertsScheduler],
  controllers: [SavedSearchesController],
  exports: [SavedSearchesService, TypeOrmModule],
})
export class SavedSearchesModule {}
