export interface ParsedJob {
  rawText: string;
  title: string;
  company: string;
  location: string;
  jobType?: string;
  salaryRange?: string;
  requirements: string[];
  responsibilities: string[];
  preferredQualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  educationRequirements: string;
  keywords: string[];
}
