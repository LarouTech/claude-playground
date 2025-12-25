import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { JobParserService } from './job-parser.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly parser: JobParserService,
  ) {}

  async analyzeJobPosting(
    userId: string,
    jobDescription: string,
    jobTitle?: string,
    company?: string,
  ): Promise<any> {
    try {
      const jobId = uuidv4();

      // Parse job posting
      const parsedData = await this.parser.parseJob(
        jobDescription,
        jobTitle,
        company,
      );

      // Save to DynamoDB
      const item = {
        PK: `USER#${userId}`,
        SK: `JOB#${jobId}`,
        GSI1PK: `JOB#${jobId}`,
        GSI1SK: `USER#${userId}`,
        jobId,
        userId,
        parsedData,
        createdAt: new Date().toISOString(),
      };

      await this.storage.saveItem(item);

      this.logger.log(`Job posting analyzed for user ${userId}: ${jobId}`);

      return {
        jobId,
        parsedData,
        createdAt: item.createdAt,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing job posting: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserJobs(userId: string): Promise<any[]> {
    try {
      const items = await this.storage.query(`USER#${userId}`, 'JOB#');

      return items.map((item) => ({
        jobId: item.jobId,
        title: item.parsedData.title,
        company: item.parsedData.company,
        createdAt: item.createdAt,
        parsedData: item.parsedData,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting user jobs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getJob(userId: string, jobId: string): Promise<any> {
    try {
      const item = await this.storage.getItem(
        `USER#${userId}`,
        `JOB#${jobId}`,
      );

      if (!item) {
        throw new NotFoundException('Job posting not found');
      }

      return {
        jobId: item.jobId,
        parsedData: item.parsedData,
        createdAt: item.createdAt,
      };
    } catch (error) {
      this.logger.error(`Error getting job: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteJob(userId: string, jobId: string): Promise<void> {
    try {
      const item = await this.storage.getItem(
        `USER#${userId}`,
        `JOB#${jobId}`,
      );

      if (!item) {
        throw new NotFoundException('Job posting not found');
      }

      await this.storage.deleteItem(`USER#${userId}`, `JOB#${jobId}`);

      this.logger.log(`Job posting deleted: ${jobId}`);
    } catch (error) {
      this.logger.error(`Error deleting job: ${error.message}`, error.stack);
      throw error;
    }
  }
}
