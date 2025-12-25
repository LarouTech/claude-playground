import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadResumeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsOptional()
  fileType?: string;
}

export class AnalyzeJobDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  jobDescription: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  company?: string;
}

export class MatchRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  resumeId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;
}

export class AcknowledgeSuggestionDto {
  @IsString()
  @IsNotEmpty()
  suggestionId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  implementationNotes?: string;
}

export class GenerateCoverLetterDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  tone?: 'professional' | 'casual' | 'enthusiastic';

  @IsString()
  @IsOptional()
  additionalInfo?: string;
}
