export interface MatchResult {
  overallScore: number;
  skillsMatch: SkillsMatch;
  experienceMatch: ExperienceMatch;
  educationMatch: EducationMatch;
  keywordMatch: KeywordMatch;
  gaps: Gap[];
  strengths: string[];
}

export interface SkillsMatch {
  score: number;
  matchedSkills: string[];
  missingRequired: string[];
  missingPreferred: string[];
  additionalSkills: string[];
}

export interface ExperienceMatch {
  score: number;
  yearsRequired?: number;
  yearsHave?: number;
  relevantExperience: string[];
  gaps: string[];
}

export interface EducationMatch {
  score: number;
  required: string;
  have: string[];
  meets: boolean;
}

export interface KeywordMatch {
  score: number;
  totalJobKeywords: number;
  matchedKeywords: number;
  missingKeywords: string[];
}

export interface Gap {
  category: 'skill' | 'experience' | 'education' | 'certification';
  description: string;
  priority: 'high' | 'medium' | 'low';
}
