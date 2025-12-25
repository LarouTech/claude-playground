import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { AIService } from '../../common/services/ai.service';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterService } from './cover-letter.service';

@Module({
  imports: [StorageModule],
  controllers: [CoverLetterController],
  providers: [CoverLetterService, AIService],
  exports: [CoverLetterService],
})
export class CoverLetterModule {}
