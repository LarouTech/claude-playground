import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { ResumeParserService } from './resume-parser.service';
import { ParsedResume } from '../../common/interfaces/resume.interface';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly parser: ResumeParserService,
  ) {}

  async uploadAndParseResume(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<any> {
    try {
      const resumeId = uuidv4();
      const s3Key = `resumes/${userId}/${resumeId}/${fileName}`;

      // Upload to S3
      await this.storage.uploadFile(s3Key, fileBuffer, mimeType);

      // Parse resume
      const parsedData = await this.parser.parseResume(fileBuffer, mimeType);

      // Save metadata to DynamoDB
      const item = {
        PK: `USER#${userId}`,
        SK: `RESUME#${resumeId}`,
        GSI1PK: `RESUME#${resumeId}`,
        GSI1SK: `USER#${userId}`,
        resumeId,
        userId,
        fileName,
        s3Key,
        mimeType,
        parsedData,
        uploadedAt: new Date().toISOString(),
      };

      await this.storage.saveItem(item);

      this.logger.log(
        `Resume uploaded and parsed for user ${userId}: ${resumeId}`,
      );

      return {
        resumeId,
        fileName,
        parsedData,
        uploadedAt: item.uploadedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading resume: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async parseResumeFromS3(userId: string, s3Key: string): Promise<any> {
    try {
      const fileBuffer = await this.storage.getFile(s3Key);
      const mimeType = this.getMimeTypeFromKey(s3Key);

      const parsedData = await this.parser.parseResume(fileBuffer, mimeType);

      const resumeId = uuidv4();
      const fileName = s3Key.split('/').pop();

      const item = {
        PK: `USER#${userId}`,
        SK: `RESUME#${resumeId}`,
        GSI1PK: `RESUME#${resumeId}`,
        GSI1SK: `USER#${userId}`,
        resumeId,
        userId,
        fileName,
        s3Key,
        mimeType,
        parsedData,
        uploadedAt: new Date().toISOString(),
      };

      await this.storage.saveItem(item);

      return {
        resumeId,
        fileName,
        parsedData,
        uploadedAt: item.uploadedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error parsing resume from S3: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUploadUrl(userId: string, fileName: string): Promise<any> {
    try {
      const resumeId = uuidv4();
      const s3Key = `resumes/${userId}/${resumeId}/${fileName}`;

      const uploadUrl = await this.storage.getPresignedUrl(s3Key);

      return {
        uploadUrl,
        resumeId,
        s3Key,
      };
    } catch (error) {
      this.logger.error(
        `Error generating upload URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserResumes(userId: string): Promise<any[]> {
    try {
      const items = await this.storage.query(`USER#${userId}`, 'RESUME#');

      return items.map((item) => ({
        resumeId: item.resumeId,
        fileName: item.fileName,
        uploadedAt: item.uploadedAt,
        parsedData: item.parsedData,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting user resumes: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getResume(userId: string, resumeId: string): Promise<any> {
    try {
      const item = await this.storage.getItem(
        `USER#${userId}`,
        `RESUME#${resumeId}`,
      );

      if (!item) {
        throw new NotFoundException('Resume not found');
      }

      return {
        resumeId: item.resumeId,
        fileName: item.fileName,
        uploadedAt: item.uploadedAt,
        parsedData: item.parsedData,
        s3Key: item.s3Key,
      };
    } catch (error) {
      this.logger.error(`Error getting resume: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    try {
      const item = await this.storage.getItem(
        `USER#${userId}`,
        `RESUME#${resumeId}`,
      );

      if (!item) {
        throw new NotFoundException('Resume not found');
      }

      // Delete from S3
      await this.storage.deleteFile(item.s3Key);

      // Delete from DynamoDB
      await this.storage.deleteItem(`USER#${userId}`, `RESUME#${resumeId}`);

      this.logger.log(`Resume deleted: ${resumeId}`);
    } catch (error) {
      this.logger.error(
        `Error deleting resume: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private getMimeTypeFromKey(s3Key: string): string {
    const ext = s3Key.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
