import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatcherService } from './matcher.service';
import { MatchRequestDto } from '../../common/dto/upload-resume.dto';

@Controller('match')
export class MatcherController {
  constructor(private readonly matcherService: MatcherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMatch(@Body() dto: MatchRequestDto) {
    return this.matcherService.createMatchAnalysis(
      dto.userId,
      dto.resumeId,
      dto.jobId,
    );
  }

  @Get(':userId/:sessionId')
  async getMatchAnalysis(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.matcherService.getMatchAnalysis(userId, sessionId);
  }

  @Get(':userId')
  async getUserMatches(@Param('userId') userId: string) {
    return this.matcherService.getUserMatches(userId);
  }
}
