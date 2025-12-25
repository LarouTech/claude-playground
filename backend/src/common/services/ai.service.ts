import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Suggestion } from '../interfaces/suggestion.interface';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private bedrockClient: BedrockRuntimeClient | null = null;
  private useBedrock: boolean;
  private modelId: string;

  constructor(private configService: ConfigService) {
    this.useBedrock = this.configService.get('USE_BEDROCK') === 'true';
    this.modelId =
      this.configService.get('BEDROCK_MODEL_ID') ||
      'anthropic.claude-3-sonnet-20240229-v1:0';

    if (this.useBedrock) {
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      this.bedrockClient = new BedrockRuntimeClient({ region });
    }
  }

  async generateSuggestions(
    resumeData: any,
    jobData: any,
    matchResult: any,
  ): Promise<Suggestion[]> {
    try {
      const prompt = this.buildSuggestionsPrompt(
        resumeData,
        jobData,
        matchResult,
      );

      let responseText: string;

      if (this.useBedrock && this.bedrockClient) {
        responseText = await this.invokeBedrockModel(prompt);
      } else {
        responseText = await this.invokeOpenAI(prompt);
      }

      return this.parseSuggestions(responseText, matchResult);
    } catch (error) {
      this.logger.error(
        `Error generating suggestions: ${error.message}`,
        error.stack,
      );
      // Fallback to template-based suggestions
      return this.generateTemplateSuggestions(matchResult);
    }
  }

  async generateCoverLetter(
    resumeData: any,
    jobData: any,
    matchResult: any,
    tone: string = 'professional',
    additionalInfo?: string,
  ): Promise<string> {
    try {
      const prompt = this.buildCoverLetterPrompt(
        resumeData,
        jobData,
        matchResult,
        tone,
        additionalInfo,
      );

      let responseText: string;

      if (this.useBedrock && this.bedrockClient) {
        responseText = await this.invokeBedrockModel(prompt);
      } else {
        responseText = await this.invokeOpenAI(prompt);
      }

      return responseText.trim();
    } catch (error) {
      this.logger.error(
        `Error generating cover letter: ${error.message}`,
        error.stack,
      );
      // Fallback to template-based cover letter
      return this.generateTemplateCoverLetter(
        resumeData,
        jobData,
        tone,
        additionalInfo,
      );
    }
  }

  private async invokeBedrockModel(prompt: string): Promise<string> {
    if (!this.bedrockClient) {
      throw new Error('Bedrock client not initialized');
    }

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.content[0].text;
  }

  private async invokeOpenAI(prompt: string): Promise<string> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private buildSuggestionsPrompt(
    resumeData: any,
    jobData: any,
    matchResult: any,
  ): string {
    return `You are a career advisor helping a job seeker improve their application.

Resume Summary:
- Skills: ${resumeData.skills.join(', ')}
- Experience: ${resumeData.experience.map((e: any) => e.title).join(', ')}
- Education: ${resumeData.education.map((e: any) => e.degree).join(', ')}

Job Requirements:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Required Skills: ${jobData.requiredSkills.join(', ')}
- Experience Level: ${jobData.experienceLevel}

Match Analysis:
- Overall Score: ${(matchResult.overallScore * 100).toFixed(0)}%
- Missing Required Skills: ${matchResult.skillsMatch.missingRequired.join(', ')}
- Gaps: ${matchResult.gaps.map((g: any) => g.description).join('; ')}

Please provide 5-7 specific, actionable suggestions to improve this candidate's application.
For each suggestion, provide:
1. Category (skill/experience/education/formatting/content)
2. Title (brief, actionable)
3. Description (what's missing or needed)
4. Priority (high/medium/low)
5. Actionable steps (specific actions to take)

Format as JSON array.`;
  }

  private buildCoverLetterPrompt(
    resumeData: any,
    jobData: any,
    matchResult: any,
    tone: string,
    additionalInfo?: string,
  ): string {
    return `Write a professional cover letter for this job application.

Candidate Information:
- Name: ${resumeData.contact?.name || '[Your Name]'}
- Email: ${resumeData.contact?.email || '[Your Email]'}
- Skills: ${resumeData.skills.slice(0, 5).join(', ')}
- Experience: ${resumeData.experience.map((e: any) => e.title).join(', ')}

Job Information:
- Position: ${jobData.title}
- Company: ${jobData.company}
- Location: ${jobData.location}

Match Strengths:
${matchResult.strengths.join('\n')}

Tone: ${tone}
${additionalInfo ? `Additional Context: ${additionalInfo}` : ''}

Write a compelling cover letter that:
1. Opens with enthusiasm for the role
2. Highlights relevant experience and skills
3. Addresses the company specifically
4. Shows personality while remaining ${tone}
5. Closes with a call to action

Format as a proper cover letter with appropriate spacing.`;
  }

  private parseSuggestions(
    responseText: string,
    matchResult: any,
  ): Suggestion[] {
    try {
      // Try to parse JSON response
      const suggestions = JSON.parse(responseText);
      return suggestions.map((s: any, index: number) => ({
        id: `suggestion-${Date.now()}-${index}`,
        category: s.category || 'content',
        title: s.title,
        description: s.description,
        priority: s.priority || 'medium',
        actionable: s.actionable || s.actions || '',
      }));
    } catch (error) {
      // Fallback to template-based
      return this.generateTemplateSuggestions(matchResult);
    }
  }

  private generateTemplateSuggestions(matchResult: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    let index = 0;

    // Generate suggestions from gaps
    matchResult.gaps.forEach((gap: any) => {
      suggestions.push({
        id: `suggestion-${Date.now()}-${index++}`,
        category: gap.category,
        title: this.generateSuggestionTitle(gap),
        description: gap.description,
        priority: gap.priority,
        actionable: this.generateActionableSteps(gap),
      });
    });

    // Add formatting suggestion
    if (suggestions.length < 5) {
      suggestions.push({
        id: `suggestion-${Date.now()}-${index}`,
        category: 'formatting',
        title: 'Optimize Resume Format',
        description:
          'Ensure your resume is ATS-friendly and highlights key achievements',
        priority: 'medium',
        actionable:
          'Use clear section headers, bullet points, and quantify achievements with metrics',
      });
    }

    return suggestions;
  }

  private generateSuggestionTitle(gap: any): string {
    const titles: Record<string, string> = {
      skill: `Develop ${gap.description.replace('Missing required skill: ', '')} skills`,
      experience: 'Gain relevant experience',
      education: 'Consider additional education or certifications',
    };
    return titles[gap.category] || 'Improve your application';
  }

  private generateActionableSteps(gap: any): string {
    const actions: Record<string, string> = {
      skill:
        'Take online courses (Coursera, Udemy), build projects, or contribute to open source',
      experience:
        'Seek internships, freelance projects, or volunteer opportunities in this area',
      education:
        'Consider relevant certifications, online degrees, or bootcamps',
    };
    return actions[gap.category] || 'Research and address this gap';
  }

  private generateTemplateCoverLetter(
    resumeData: any,
    jobData: any,
    tone: string,
    additionalInfo?: string,
  ): string {
    const name = resumeData.contact?.name || '[Your Name]';
    const email = resumeData.contact?.email || '[Your Email]';
    const phone = resumeData.contact?.phone || '[Your Phone]';

    const greeting = tone === 'casual' ? 'Hi there,' : 'Dear Hiring Manager,';
    const closing = tone === 'casual' ? 'Best regards,' : 'Sincerely,';

    return `${name}
${email} | ${phone}

${new Date().toLocaleDateString()}

${jobData.company}
${jobData.location}

${greeting}

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}. With my background in ${resumeData.skills.slice(0, 3).join(', ')}, I am confident I would be a valuable addition to your team.

My experience aligns well with your requirements. ${resumeData.experience.length > 0 ? `As a ${resumeData.experience[0].title}, I have developed strong expertise in relevant technologies and methodologies.` : 'I bring relevant skills and enthusiasm to this role.'}

I am particularly excited about this opportunity ${additionalInfo ? `because ${additionalInfo}` : 'and the potential to contribute to your team\'s success'}.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${jobData.company}'s continued success. Thank you for considering my application.

${closing}
${name}`;
  }
}
