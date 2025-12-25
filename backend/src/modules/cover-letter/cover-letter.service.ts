import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CoverLetterService {
  private readonly logger = new Logger(CoverLetterService.name);

  constructor(private readonly storage: StorageService) {}

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

      // Generate cover letter using template
      const coverLetter = this.generateTemplate(
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

  private generateTemplate(
    resumeData: any,
    jobData: any,
    matchResult: any,
    tone: string,
    additionalInfo?: string,
  ): string {
    const name = resumeData.contact?.name || '[Your Name]';
    const email = resumeData.contact?.email || '[Your Email]';
    const phone = resumeData.contact?.phone || '[Your Phone]';
    const company = jobData.company || '[Company Name]';
    const position = jobData.title || '[Position]';

    const greeting =
      tone === 'casual' ? 'Hi there,' : 'Dear Hiring Manager,';

    const skills = matchResult.skillsMatch.matchedSkills.slice(0, 3).join(', ');

    const template = `${name}
${email} | ${phone}

${new Date().toLocaleDateString()}

${company}
${jobData.location || ''}

${greeting}

I am writing to express my strong interest in the ${position} position at ${company}. With my background in ${skills}, I am confident that I would be a valuable addition to your team.

My experience aligns well with your requirements:

${this.generateExperienceSection(resumeData, jobData, matchResult)}

I am particularly excited about this opportunity because ${additionalInfo || 'of the company\'s innovative approach and growth potential'}.

${matchResult.strengths.length > 0 ? `\nKey qualifications:\n${matchResult.strengths.map((s: string) => `- ${s}`).join('\n')}` : ''}

I would welcome the opportunity to discuss how my skills and experience can contribute to ${company}'s success. Thank you for considering my application.

${tone === 'casual' ? 'Best regards,' : 'Sincerely,'}
${name}`;

    return template;
  }

  private generateExperienceSection(
    resumeData: any,
    jobData: any,
    matchResult: any,
  ): string {
    const experiences = resumeData.experience || [];

    if (experiences.length === 0) {
      return '- Strong foundation in relevant technologies and methodologies';
    }

    return experiences
      .slice(0, 2)
      .map(
        (exp: any) =>
          `- ${exp.title}: ${exp.description?.[0] || 'Relevant professional experience'}`,
      )
      .join('\n');
  }
}
