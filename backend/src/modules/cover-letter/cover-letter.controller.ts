import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto } from '../../common/dto/upload-resume.dto';

@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateCoverLetter(@Body() dto: GenerateCoverLetterDto) {
    return this.coverLetterService.generateCoverLetter(
      dto.userId,
      dto.sessionId,
      dto.tone,
      dto.additionalInfo,
    );
  }

  @Get(':userId/:sessionId')
  async getCoverLetter(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.coverLetterService.getCoverLetter(userId, sessionId);
  }
}
