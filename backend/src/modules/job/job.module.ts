import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobParserService } from './job-parser.service';

@Module({
  imports: [StorageModule],
  controllers: [JobController],
  providers: [JobService, JobParserService],
  exports: [JobService, JobParserService],
})
export class JobModule {}
