import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { UploadResumeDto } from '../../common/dto/upload-resume.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadResumeDto,
  ) {
    return this.resumeService.uploadAndParseResume(
      dto.userId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('presigned-url/:userId/:fileName')
  async getPresignedUrl(
    @Param('userId') userId: string,
    @Param('fileName') fileName: string,
  ) {
    return this.resumeService.getUploadUrl(userId, fileName);
  }

  @Post('parse-from-s3')
  async parseFromS3(@Body() body: { userId: string; s3Key: string }) {
    return this.resumeService.parseResumeFromS3(body.userId, body.s3Key);
  }

  @Get(':userId')
  async getUserResumes(@Param('userId') userId: string) {
    return this.resumeService.getUserResumes(userId);
  }

  @Get(':userId/:resumeId')
  async getResume(
    @Param('userId') userId: string,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumeService.getResume(userId, resumeId);
  }

  @Delete(':userId/:resumeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResume(
    @Param('userId') userId: string,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumeService.deleteResume(userId, resumeId);
  }
}
