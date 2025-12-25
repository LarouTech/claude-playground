import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ResumeModule } from '../resume/resume.module';
import { JobModule } from '../job/job.module';
import { SuggestionsModule } from '../suggestions/suggestions.module';
import { MatcherController } from './matcher.controller';
import { MatcherService } from './matcher.service';

@Module({
  imports: [StorageModule, ResumeModule, JobModule, SuggestionsModule],
  controllers: [MatcherController],
  providers: [MatcherService],
  exports: [MatcherService],
})
export class MatcherModule {}
