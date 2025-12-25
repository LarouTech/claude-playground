import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobService } from './job.service';
import { AnalyzeJobDto } from '../../common/dto/upload-resume.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.CREATED)
  async analyzeJob(@Body() dto: AnalyzeJobDto) {
    return this.jobService.analyzeJobPosting(
      dto.userId,
      dto.jobDescription,
      dto.jobTitle,
      dto.company,
    );
  }

  @Get(':userId')
  async getUserJobs(@Param('userId') userId: string) {
    return this.jobService.getUserJobs(userId);
  }

  @Get(':userId/:jobId')
  async getJob(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobService.getJob(userId, jobId);
  }

  @Delete(':userId/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobService.deleteJob(userId, jobId);
  }
}
