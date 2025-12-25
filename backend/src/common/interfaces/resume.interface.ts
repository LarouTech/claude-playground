export interface ParsedResume {
  rawText: string;
  contact: ContactInfo;
  summary?: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  projects?: ProjectItem[];
  certifications?: string[];
  keywords: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  name?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduationDate?: string;
  gpa?: string;
  fieldOfStudy?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
  skills?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}
