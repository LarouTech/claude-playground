import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { AIService } from '../../common/services/ai.service';
import { Suggestion } from '../../common/interfaces/suggestion.interface';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly aiService: AIService,
  ) {}

  async generateSuggestions(
    userId: string,
    sessionId: string,
    resumeData: any,
    jobData: any,
    matchResult: any,
  ): Promise<Suggestion[]> {
    try {
      // Use AI service to generate suggestions
      const aiSuggestions = await this.aiService.generateSuggestions(
        resumeData,
        jobData,
        matchResult,
      );

      // Save to DynamoDB
      const suggestions: Suggestion[] = [];
      for (const suggestion of aiSuggestions) {
        const suggestionWithId = {
          ...suggestion,
          id: uuidv4(),
        };

        await this.storage.saveItem({
          PK: `SESSION#${sessionId}`,
          SK: `SUGGESTION#${suggestionWithId.id}`,
          GSI1PK: `USER#${userId}`,
          GSI1SK: `SUGGESTION#${suggestionWithId.id}`,
          ...suggestionWithId,
          userId,
          sessionId,
        });

        suggestions.push(suggestionWithId);
      }

      this.logger.log(
        `Generated ${suggestions.length} suggestions for session ${sessionId}`,
      );

      return suggestions;
    } catch (error) {
      this.logger.error(
        `Error generating suggestions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getSuggestions(sessionId: string): Promise<Suggestion[]> {
    try {
      const items = await this.storage.query(
        `SESSION#${sessionId}`,
        'SUGGESTION#',
      );

      return items.map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        description: item.description,
        priority: item.priority,
        actionable: item.actionable,
        acknowledged: item.acknowledged || false,
        acknowledgedAt: item.acknowledgedAt,
        implementationNotes: item.implementationNotes,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting suggestions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async acknowledgeSuggestion(
    userId: string,
    suggestionId: string,
    implementationNotes?: string,
  ): Promise<void> {
    try {
      // Query to find the suggestion
      const sessions = await this.storage.query(
        `USER#${userId}`,
        'SUGGESTION#',
      );

      const suggestionItem = sessions.find(
        (item) => item.SK === `SUGGESTION#${suggestionId}`,
      );

      if (!suggestionItem) {
        throw new NotFoundException('Suggestion not found');
      }

      await this.storage.updateItem(suggestionItem.PK, suggestionItem.SK, {
        acknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        implementationNotes,
      });

      this.logger.log(`Suggestion acknowledged: ${suggestionId}`);
    } catch (error) {
      this.logger.error(
        `Error acknowledging suggestion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
