import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { AIService } from '../../common/services/ai.service';

@Injectable()
export class CoverLetterService {
  private readonly logger = new Logger(CoverLetterService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly aiService: AIService,
  ) {}

  async generateCoverLetter(
    userId: string,
    sessionId: string,
    tone: string = 'professional',
    additionalInfo?: string,
  ): Promise<any> {
    try {
      // Get session data
      const session = await this.storage.getItem(
        `USER#${userId}`,
        `SESSION#${sessionId}`,
      );

      if (!session) {
        throw new Error('Session not found');
      }

      // Generate cover letter using AI service
      const coverLetter = await this.aiService.generateCoverLetter(
        session.resumeData,
        session.jobData,
        session.matchResult,
        tone,
        additionalInfo,
      );

      // Save cover letter
      await this.storage.updateItem(`USER#${userId}`, `SESSION#${sessionId}`, {
        coverLetter,
        coverLetterGeneratedAt: new Date().toISOString(),
      });

      this.logger.log(`Cover letter generated for session ${sessionId}`);

      return {
        coverLetter,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error generating cover letter: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCoverLetter(userId: string, sessionId: string): Promise<any> {
    try {
      const session = await this.storage.getItem(
        `USER#${userId}`,
        `SESSION#${sessionId}`,
      );

      if (!session || !session.coverLetter) {
        return null;
      }

      return {
        coverLetter: session.coverLetter,
        generatedAt: session.coverLetterGeneratedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error getting cover letter: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
