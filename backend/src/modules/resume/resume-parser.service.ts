import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import {
  ParsedResume,
  ContactInfo,
  EducationItem,
  ExperienceItem,
} from '../../common/interfaces/resume.interface';

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  async parseResume(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<ParsedResume> {
    try {
      let text: string;

      if (mimeType === 'application/pdf') {
        text = await this.parsePDF(fileBuffer);
      } else if (
        mimeType === 'application/msword' ||
        mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        text = await this.parseDOCX(fileBuffer);
      } else if (mimeType === 'text/plain') {
        text = fileBuffer.toString('utf-8');
      } else {
        throw new BadRequestException('Unsupported file type');
      }

      return this.extractInformation(text);
    } catch (error) {
      this.logger.error(`Error parsing resume: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async parsePDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async parseDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private extractInformation(text: string): ParsedResume {
    return {
      rawText: text,
      contact: this.extractContact(text),
      summary: this.extractSummary(text),
      education: this.extractEducation(text),
      experience: this.extractExperience(text),
      skills: this.extractSkills(text),
      projects: [],
      certifications: this.extractCertifications(text),
      keywords: this.extractKeywords(text),
    };
  }

  private extractContact(text: string): ContactInfo {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex =
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
    const githubRegex = /github\.com\/[\w-]+/i;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const githubMatch = text.match(githubRegex);

    // Try to extract name from first lines
    const lines = text.split('\n').filter((l) => l.trim());
    const name = lines[0]?.trim();

    return {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
      name: name && name.length < 50 ? name : undefined,
    };
  }

  private extractSummary(text: string): string {
    const summaryRegex =
      /(?:summary|objective|profile)[\s:]*\n(.+?)(?=\n\n|\n[A-Z][A-Za-z\s]+:?)/is;
    const match = text.match(summaryRegex);
    return match ? match[1].trim() : '';
  }

  private extractEducation(text: string): EducationItem[] {
    const education: EducationItem[] = [];
    const educationSection = this.extractSection(text, /education/i);

    if (!educationSection) return education;

    // Look for degree patterns
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Ph\.D|Associate|B\.S\.|M\.S\.|B\.A\.|M\.A\.).*?(?:\n|$)/gi,
    ];

    degreePatterns.forEach((pattern) => {
      const matches = educationSection.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          education.push({
            degree: match.trim(),
            institution: '',
          });
        });
      }
    });

    return education;
  }

  private extractExperience(text: string): ExperienceItem[] {
    const experience: ExperienceItem[] = [];
    const experienceSection = this.extractSection(
      text,
      /(?:experience|employment|work history)/i,
    );

    if (!experienceSection) return experience;

    // Split by common job title patterns or bullet points
    const lines = experienceSection.split('\n').filter((l) => l.trim());

    let currentJob: Partial<ExperienceItem> | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) return;

      // Check if this looks like a job title/company line
      if (this.looksLikeJobTitle(trimmed)) {
        if (currentJob && currentJob.title) {
          experience.push(currentJob as ExperienceItem);
        }

        currentJob = {
          title: trimmed,
          company: '',
          description: [],
        };
      } else if (currentJob) {
        // Add to description
        const cleaned = trimmed.replace(/^[-•●*]\s*/, '');
        if (cleaned) {
          currentJob.description = currentJob.description || [];
          currentJob.description.push(cleaned);
        }
      }
    });

    // Add last job
    if (currentJob && currentJob.title) {
      experience.push(currentJob as ExperienceItem);
    }

    return experience;
  }

  private looksLikeJobTitle(line: string): boolean {
    // Heuristics for identifying job titles
    const titleKeywords = [
      'engineer',
      'developer',
      'manager',
      'analyst',
      'designer',
      'consultant',
      'specialist',
      'director',
      'lead',
      'senior',
      'junior',
      'associate',
      'intern',
    ];

    const lower = line.toLowerCase();
    return titleKeywords.some((keyword) => lower.includes(keyword));
  }

  private extractSkills(text: string): string[] {
    const skills = new Set<string>();
    const skillsSection = this.extractSection(text, /skills/i);

    const techSkills = [
      // Programming languages
      'Python',
      'Java',
      'JavaScript',
      'TypeScript',
      'C++',
      'C#',
      'Ruby',
      'Go',
      'Rust',
      'Swift',
      'Kotlin',
      'PHP',
      'Scala',
      // Frameworks
      'React',
      'Angular',
      'Vue',
      'Node.js',
      'NestJS',
      'Express',
      'Django',
      'Flask',
      'Spring',
      'Rails',
      'FastAPI',
      // Cloud/DevOps
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'Git',
      'GitHub',
      'GitLab',
      'CI/CD',
      'Terraform',
      // Databases
      'SQL',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'DynamoDB',
      'Elasticsearch',
      'Oracle',
      // Other
      'REST',
      'GraphQL',
      'Microservices',
      'Agile',
      'Scrum',
      'TDD',
      'Machine Learning',
      'AI',
      'Data Science',
    ];

    // Search for skills in the skills section and full text
    const searchText = skillsSection || text;

    techSkills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(searchText)) {
        skills.add(skill);
      }
    });

    // Also extract from skills section if present
    if (skillsSection) {
      const items = skillsSection.split(/[,;\n•●]/);
      items.forEach((item) => {
        const cleaned = item.trim().replace(/^[-•●*]\s*/, '');
        if (cleaned && cleaned.length > 1 && cleaned.length < 50) {
          skills.add(cleaned);
        }
      });
    }

    return Array.from(skills);
  }

  private extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    const certSection = this.extractSection(
      text,
      /(?:certifications?|licenses?)/i,
    );

    if (!certSection) return certifications;

    const lines = certSection.split('\n');
    lines.forEach((line) => {
      const cleaned = line.trim().replace(/^[-•●*]\s*/, '');
      if (cleaned && cleaned.length > 5) {
        certifications.push(cleaned);
      }
    });

    return certifications;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
      'this',
      'that',
      'these',
      'those',
    ]);

    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const keywords = words.filter((word) => !stopWords.has(word));

    // Count frequency and return top keywords
    const frequency: Record<string, number> = {};
    keywords.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map((entry) => entry[0]);
  }

  private extractSection(text: string, sectionRegex: RegExp): string | null {
    const match = text.match(sectionRegex);
    if (!match) return null;

    const start = match.index! + match[0].length;

    // Find next section (capital letters followed by colon or double newline)
    const nextSection = text
      .slice(start)
      .match(/\n\s*\n[A-Z][A-Za-z\s]+:?(?:\n|$)/);
    const end = nextSection ? start + nextSection.index! : text.length;

    return text.slice(start, end).trim();
  }
}
