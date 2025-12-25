import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { AcknowledgeSuggestionDto } from '../../common/dto/upload-resume.dto';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get('session/:sessionId')
  async getSuggestions(@Param('sessionId') sessionId: string) {
    return this.suggestionsService.getSuggestions(sessionId);
  }

  @Post('acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledgeSuggestion(@Body() dto: AcknowledgeSuggestionDto) {
    return this.suggestionsService.acknowledgeSuggestion(
      dto.userId,
      dto.suggestionId,
      dto.implementationNotes,
    );
  }
}
