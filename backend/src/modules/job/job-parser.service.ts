import { Injectable, Logger } from '@nestjs/common';
import { ParsedJob } from '../../common/interfaces/job.interface';

@Injectable()
export class JobParserService {
  private readonly logger = new Logger(JobParserService.name);

  async parseJob(
    jobDescription: string,
    jobTitle?: string,
    company?: string,
  ): Promise<ParsedJob> {
    try {
      const extracted = {
        rawText: jobDescription,
        title: jobTitle || this.extractTitle(jobDescription),
        company: company || this.extractCompany(jobDescription),
        location: this.extractLocation(jobDescription),
        jobType: this.extractJobType(jobDescription),
        salaryRange: this.extractSalaryRange(jobDescription),
        requirements: this.extractRequirements(jobDescription),
        responsibilities: this.extractResponsibilities(jobDescription),
        preferredQualifications: this.extractPreferredQualifications(jobDescription),
        requiredSkills: this.extractSkills(jobDescription, true),
        preferredSkills: this.extractSkills(jobDescription, false),
        experienceLevel: this.extractExperienceLevel(jobDescription),
        educationRequirements: this.extractEducation(jobDescription),
        keywords: this.extractKeywords(jobDescription),
      };

      return extracted;
    } catch (error) {
      this.logger.error(
        `Error parsing job posting: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private extractTitle(text: string): string {
    const lines = text.split('\n').filter((l) => l.trim());

    for (const line of lines.slice(0, 5)) {
      if (
        /\b(engineer|developer|manager|analyst|designer|specialist)\b/i.test(
          line,
        ) &&
        line.length < 100
      ) {
        return line.trim();
      }
    }

    return lines[0]?.trim() || 'Unknown Position';
  }

  private extractCompany(text: string): string {
    const companyMatch = text.match(/(?:company|employer)[\s:]+([^\n]+)/i);
    if (companyMatch) return companyMatch[1].trim();

    const atMatch = text.match(/\bat\s+([A-Z][A-Za-z\s&,.-]+?)(?:\s*[|\n]|$)/);
    if (atMatch && atMatch[1].length < 50) return atMatch[1].trim();

    return 'Unknown Company';
  }

  private extractLocation(text: string): string {
    const locationMatch = text.match(/(?:location|based in)[\s:]+([^\n]+)/i);
    if (locationMatch) return locationMatch[1].trim();

    const cityStateMatch = text.match(
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/,
    );
    if (cityStateMatch)
      return `${cityStateMatch[1]}, ${cityStateMatch[2]}`;

    if (/\b(remote|work from home|wfh)\b/i.test(text)) return 'Remote';

    return 'Location not specified';
  }

  private extractJobType(text: string): string {
    if (/\bfull.?time\b/i.test(text)) return 'Full-time';
    if (/\bpart.?time\b/i.test(text)) return 'Part-time';
    if (/\bcontract\b/i.test(text)) return 'Contract';
    if (/\binternship\b/i.test(text)) return 'Internship';
    return 'Not specified';
  }

  private extractSalaryRange(text: string): string {
    const salaryMatch = text.match(
      /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    );
    if (salaryMatch) return `$${salaryMatch[1]} - $${salaryMatch[2]}`;

    const singleSalary = text.match(/\$\s*(\d{1,3}(?:,\d{3})*)/);
    if (singleSalary) return `$${singleSalary[1]}`;

    return 'Not specified';
  }

  private extractRequirements(text: string): string[] {
    return this.extractListSection(
      text,
      /(?:requirements?|qualifications?|what.*(?:need|looking for))/i,
    );
  }

  private extractResponsibilities(text: string): string[] {
    return this.extractListSection(
      text,
      /(?:responsibilities|duties|what you.*do)/i,
    );
  }

  private extractPreferredQualifications(text: string): string[] {
    return this.extractListSection(
      text,
      /(?:preferred|nice to have|bonus|plus)/i,
    );
  }

  private extractListSection(text: string, sectionRegex: RegExp): string[] {
    const match = text.match(sectionRegex);
    if (!match) return [];

    const start = match.index! + match[0].length;
    const nextSection = text
      .slice(start)
      .match(/\n\s*\n[A-Z][A-Za-z\s]+:?(?:\n|$)/);
    const end = nextSection ? start + nextSection.index! : text.length;

    const sectionText = text.slice(start, end).trim();
    const items: string[] = [];

    sectionText.split('\n').forEach((line) => {
      const cleaned = line.trim().replace(/^[-•●*]\s*/, '');
      if (cleaned && cleaned.length > 10) {
        items.push(cleaned);
      }
    });

    return items;
  }

  private extractSkills(text: string, required: boolean): string[] {
    const skills = new Set<string>();
    const section = required
      ? this.extractListSection(
          text,
          /(?:requirements?|qualifications?|must have)/i,
        )
      : this.extractListSection(text, /(?:preferred|nice to have|bonus)/i);

    const techPatterns = [
      /\b(Python|Java|JavaScript|TypeScript|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP)\b/gi,
      /\b(React|Angular|Vue|Node\.js|NestJS|Django|Flask|Spring|Rails|Express)\b/gi,
      /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|GitHub|GitLab|CI\/CD)\b/gi,
      /\b(SQL|PostgreSQL|MySQL|MongoDB|Redis|DynamoDB|Elasticsearch)\b/gi,
      /\b(Agile|Scrum|Kanban|DevOps|TDD|REST|GraphQL|Microservices)\b/gi,
    ];

    const searchText = section.join(' ');

    techPatterns.forEach((pattern) => {
      const matches = searchText.match(pattern);
      if (matches) {
        matches.forEach((match) => skills.add(match));
      }
    });

    // Also check full text for required skills
    if (required) {
      techPatterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach((match) => skills.add(match));
        }
      });
    }

    return Array.from(skills);
  }

  private extractExperienceLevel(text: string): string {
    const expMatch = text.match(
      /(\d+)[\s+-]*(?:to|\-)?\s*(\d+)?\s*(?:\+)?\s*years?(?:\s+of)?\s+(?:experience|exp)/i,
    );

    if (expMatch) {
      const min = expMatch[1];
      const max = expMatch[2];
      return max ? `${min}-${max} years` : `${min}+ years`;
    }

    if (/\b(senior|sr\.)\b/i.test(text)) return 'Senior (5+ years)';
    if (/\b(junior|jr\.)\b/i.test(text)) return 'Junior (0-2 years)';
    if (/\b(mid-level|intermediate)\b/i.test(text))
      return 'Mid-level (2-5 years)';
    if (/\b(entry.?level|entry.?position)\b/i.test(text))
      return 'Entry-level (0-1 years)';

    return 'Not specified';
  }

  private extractEducation(text: string): string {
    if (/\b(PhD|Ph\.D\.|Doctorate)\b/i.test(text)) return 'PhD';
    if (/\b(Master'?s?|M\.S\.|M\.A\.|MBA)\b/i.test(text))
      return "Master's degree";
    if (/\b(Bachelor'?s?|B\.S\.|B\.A\.)\b/i.test(text))
      return "Bachelor's degree";
    if (/\b(Associate'?s?|A\.S\.|A\.A\.)\b/i.test(text))
      return "Associate's degree";

    return 'Not specified';
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
      'we',
      'you',
      'our',
      'your',
    ]);

    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const keywords = words.filter((word) => !stopWords.has(word));

    const frequency: Record<string, number> = {};
    keywords.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map((entry) => entry[0]);
  }
}
