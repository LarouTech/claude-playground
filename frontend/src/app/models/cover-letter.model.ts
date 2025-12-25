export interface CoverLetter {
  coverLetter: string;
  generatedAt: string;
}

export interface GenerateCoverLetterRequest {
  userId: string;
  sessionId: string;
  tone?: 'professional' | 'casual' | 'enthusiastic';
  additionalInfo?: string;
}
