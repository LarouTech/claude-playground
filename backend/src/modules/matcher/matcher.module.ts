import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ResumeModule } from '../resume/resume.module';
import { JobModule } from '../job/job.module';
import { MatcherController } from './matcher.controller';
import { MatcherService } from './matcher.service';

@Module({
  imports: [StorageModule, ResumeModule, JobModule],
  controllers: [MatcherController],
  providers: [MatcherService],
  exports: [MatcherService],
})
export class MatcherModule {}
