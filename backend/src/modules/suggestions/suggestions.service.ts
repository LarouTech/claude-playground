import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { Suggestion } from '../../common/interfaces/suggestion.interface';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(private readonly storage: StorageService) {}

  async generateSuggestions(
    userId: string,
    sessionId: string,
    matchResult: any,
  ): Promise<Suggestion[]> {
    try {
      const suggestions: Suggestion[] = [];

      // Generate suggestions based on gaps
      matchResult.gaps.forEach((gap: any, index: number) => {
        const suggestion: Suggestion = {
          id: uuidv4(),
          category: gap.category,
          title: this.generateTitle(gap),
          description: gap.description,
          priority: gap.priority,
          actionable: this.generateActionable(gap),
          acknowledged: false,
        };

        suggestions.push(suggestion);

        // Save to DynamoDB
        this.storage.saveItem({
          PK: `SESSION#${sessionId}`,
          SK: `SUGGESTION#${suggestion.id}`,
          GSI1PK: `USER#${userId}`,
          GSI1SK: `SUGGESTION#${suggestion.id}`,
          ...suggestion,
          userId,
          sessionId,
        });
      });

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
      // Find the suggestion
      const items = await this.storage.query(
        `USER#${userId}`,
        `SUGGESTION#${suggestionId}`,
      );

      if (items.length === 0) {
        throw new NotFoundException('Suggestion not found');
      }

      const item = items[0];

      await this.storage.updateItem(item.PK, item.SK, {
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

  private generateTitle(gap: any): string {
    const titles: Record<string, string> = {
      skill: `Add ${gap.description.replace('Missing required skill: ', '')} to your skillset`,
      experience: 'Gain more relevant experience',
      education: 'Consider additional education',
    };

    return titles[gap.category] || 'Improve your application';
  }

  private generateActionable(gap: any): string {
    const actionables: Record<string, string> = {
      skill: `Take an online course or build a project using ${gap.description.replace('Missing required skill: ', '')}`,
      experience: 'Seek internships, freelance projects, or contribute to open source',
      education: 'Consider enrolling in a degree program or taking relevant courses',
    };

    return actionables[gap.category] || 'Review and improve this area';
  }
}
