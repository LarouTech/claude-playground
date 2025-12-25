import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { AIService } from '../../common/services/ai.service';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [StorageModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, AIService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
