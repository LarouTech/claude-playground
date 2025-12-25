import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { ResumeService } from '../resume/resume.service';
import { JobService } from '../job/job.service';
import {
  MatchResult,
  SkillsMatch,
  ExperienceMatch,
  EducationMatch,
  KeywordMatch,
  Gap,
} from '../../common/interfaces/match.interface';

@Injectable()
export class MatcherService {
  private readonly logger = new Logger(MatcherService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly resumeService: ResumeService,
    private readonly jobService: JobService,
  ) {}

  async createMatchAnalysis(
    userId: string,
    resumeId: string,
    jobId: string,
  ): Promise<any> {
    try {
      // Get resume and job data
      const resume = await this.resumeService.getResume(userId, resumeId);
      const job = await this.jobService.getJob(userId, jobId);

      // Perform matching
      const matchResult = this.performMatching(
        resume.parsedData,
        job.parsedData,
      );

      // Create session
      const sessionId = uuidv4();
      const item = {
        PK: `USER#${userId}`,
        SK: `SESSION#${sessionId}`,
        GSI1PK: `SESSION#${sessionId}`,
        GSI1SK: `USER#${userId}`,
        sessionId,
        userId,
        resumeId,
        jobId,
        matchResult,
        resumeData: resume.parsedData,
        jobData: job.parsedData,
        createdAt: new Date().toISOString(),
      };

      await this.storage.saveItem(item);

      this.logger.log(
        `Match analysis created for user ${userId}: ${sessionId}`,
      );

      return {
        sessionId,
        matchResult,
        resumeId,
        jobId,
        createdAt: item.createdAt,
      };
    } catch (error) {
      this.logger.error(
        `Error creating match analysis: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getMatchAnalysis(userId: string, sessionId: string): Promise<any> {
    try {
      const item = await this.storage.getItem(
        `USER#${userId}`,
        `SESSION#${sessionId}`,
      );

      if (!item) {
        throw new NotFoundException('Match analysis not found');
      }

      return {
        sessionId: item.sessionId,
        matchResult: item.matchResult,
        resumeId: item.resumeId,
        jobId: item.jobId,
        createdAt: item.createdAt,
      };
    } catch (error) {
      this.logger.error(
        `Error getting match analysis: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUserMatches(userId: string): Promise<any[]> {
    try {
      const items = await this.storage.query(`USER#${userId}`, 'SESSION#');

      return items.map((item) => ({
        sessionId: item.sessionId,
        resumeId: item.resumeId,
        jobId: item.jobId,
        matchScore: item.matchResult.overallScore,
        createdAt: item.createdAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting user matches: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private performMatching(resumeData: any, jobData: any): MatchResult {
    const skillsMatch = this.matchSkills(resumeData, jobData);
    const experienceMatch = this.matchExperience(resumeData, jobData);
    const educationMatch = this.matchEducation(resumeData, jobData);
    const keywordMatch = this.matchKeywords(resumeData, jobData);

    // Calculate overall score (weighted average)
    const overallScore =
      skillsMatch.score * 0.4 +
      experienceMatch.score * 0.25 +
      educationMatch.score * 0.15 +
      keywordMatch.score * 0.2;

    const gaps = this.identifyGaps(
      skillsMatch,
      experienceMatch,
      educationMatch,
    );
    const strengths = this.identifyStrengths(
      skillsMatch,
      experienceMatch,
      educationMatch,
    );

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      skillsMatch,
      experienceMatch,
      educationMatch,
      keywordMatch,
      gaps,
      strengths,
    };
  }

  private matchSkills(resumeData: any, jobData: any): SkillsMatch {
    const resumeSkills = new Set(
      (resumeData.skills || []).map((s: string) => s.toLowerCase()),
    );
    const requiredSkills = new Set(
      (jobData.requiredSkills || []).map((s: string) => s.toLowerCase()),
    );
    const preferredSkills = new Set(
      (jobData.preferredSkills || []).map((s: string) => s.toLowerCase()),
    );

    const matchedSkills: string[] = [];
    const missingRequired: string[] = [];
    const missingPreferred: string[] = [];

    // Check required skills
    requiredSkills.forEach((skill) => {
      if (resumeSkills.has(skill)) {
        matchedSkills.push(skill as string);
      } else {
        missingRequired.push(skill as string);
      }
    });

    // Check preferred skills
    preferredSkills.forEach((skill) => {
      if (resumeSkills.has(skill)) {
        if (!matchedSkills.includes(skill as string)) {
          matchedSkills.push(skill as string);
        }
      } else {
        missingPreferred.push(skill as string);
      }
    });

    // Calculate score
    const totalRequired = requiredSkills.size || 1;
    const matchedRequired = matchedSkills.filter((s) =>
      requiredSkills.has(s),
    ).length;
    const score = matchedRequired / totalRequired;

    return {
      score,
      matchedSkills,
      missingRequired,
      missingPreferred,
      additionalSkills: Array.from(resumeSkills).filter(
        (s) => !requiredSkills.has(s) && !preferredSkills.has(s),
      ) as string[],
    };
  }

  private matchExperience(resumeData: any, jobData: any): ExperienceMatch {
    const experience = resumeData.experience || [];

    // Extract years from experience level
    const requiredYearsMatch = jobData.experienceLevel.match(/(\d+)/);
    const yearsRequired = requiredYearsMatch
      ? parseInt(requiredYearsMatch[1])
      : 0;

    // Estimate years from resume (rough calculation)
    const yearsHave = experience.length * 2; // Assume 2 years per position

    const score = yearsRequired > 0 ? Math.min(yearsHave / yearsRequired, 1) : 1;

    return {
      score,
      yearsRequired,
      yearsHave,
      relevantExperience: experience.map((e: any) => e.title),
      gaps:
        yearsHave < yearsRequired
          ? [`Need ${yearsRequired - yearsHave} more years of experience`]
          : [],
    };
  }

  private matchEducation(resumeData: any, jobData: any): EducationMatch {
    const education = resumeData.education || [];
    const required = jobData.educationRequirements;

    const educationLevels: Record<string, number> = {
      'High school': 1,
      Associate: 2,
      Bachelor: 3,
      Master: 4,
      PhD: 5,
    };

    const requiredLevel = Object.keys(educationLevels).find((level) =>
      required.includes(level),
    );
    const requiredScore = requiredLevel ? educationLevels[requiredLevel] : 0;

    let highestLevel = 0;
    education.forEach((edu: any) => {
      Object.keys(educationLevels).forEach((level) => {
        if (edu.degree.includes(level)) {
          highestLevel = Math.max(highestLevel, educationLevels[level]);
        }
      });
    });

    const meets = highestLevel >= requiredScore;
    const score = requiredScore > 0 ? Math.min(highestLevel / requiredScore, 1) : 1;

    return {
      score,
      required,
      have: education.map((e: any) => e.degree),
      meets,
    };
  }

  private matchKeywords(resumeData: any, jobData: any): KeywordMatch {
    const resumeKeywords = new Set(
      (resumeData.keywords || []).map((k: string) => k.toLowerCase()),
    );
    const jobKeywords = new Set(
      (jobData.keywords || []).map((k: string) => k.toLowerCase()),
    );

    let matchedCount = 0;
    const missingKeywords: string[] = [];

    jobKeywords.forEach((keyword) => {
      if (resumeKeywords.has(keyword)) {
        matchedCount++;
      } else {
        missingKeywords.push(keyword as string);
      }
    });

    const score = jobKeywords.size > 0 ? matchedCount / jobKeywords.size : 0;

    return {
      score,
      totalJobKeywords: jobKeywords.size,
      matchedKeywords: matchedCount,
      missingKeywords: missingKeywords.slice(0, 10), // Limit to top 10
    };
  }

  private identifyGaps(
    skillsMatch: SkillsMatch,
    experienceMatch: ExperienceMatch,
    educationMatch: EducationMatch,
  ): Gap[] {
    const gaps: Gap[] = [];

    // Skill gaps
    skillsMatch.missingRequired.forEach((skill) => {
      gaps.push({
        category: 'skill',
        description: `Missing required skill: ${skill}`,
        priority: 'high',
      });
    });

    skillsMatch.missingPreferred.slice(0, 3).forEach((skill) => {
      gaps.push({
        category: 'skill',
        description: `Missing preferred skill: ${skill}`,
        priority: 'medium',
      });
    });

    // Experience gaps
    experienceMatch.gaps.forEach((gap) => {
      gaps.push({
        category: 'experience',
        description: gap,
        priority: 'high',
      });
    });

    // Education gaps
    if (!educationMatch.meets) {
      gaps.push({
        category: 'education',
        description: `Education requirement: ${educationMatch.required}`,
        priority: 'medium',
      });
    }

    return gaps;
  }

  private identifyStrengths(
    skillsMatch: SkillsMatch,
    experienceMatch: ExperienceMatch,
    educationMatch: EducationMatch,
  ): string[] {
    const strengths: string[] = [];

    if (skillsMatch.score >= 0.8) {
      strengths.push('Strong skill match with job requirements');
    }

    if (experienceMatch.score >= 1) {
      strengths.push('Meets or exceeds experience requirements');
    }

    if (educationMatch.meets) {
      strengths.push('Education requirements met');
    }

    if (skillsMatch.additionalSkills.length > 5) {
      strengths.push(
        `${skillsMatch.additionalSkills.length} additional valuable skills`,
      );
    }

    return strengths;
  }
}
