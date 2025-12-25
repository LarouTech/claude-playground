import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeParserService } from './resume-parser.service';

@Module({
  imports: [StorageModule],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeParserService],
  exports: [ResumeService, ResumeParserService],
})
export class ResumeModule {}
