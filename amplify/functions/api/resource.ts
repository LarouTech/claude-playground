import { defineFunction } from '@aws-amplify/backend';

/**
 * NestJS REST API Lambda Function
 * Handles all API routes for the Job Resume Analyzer
 */
export const apiFunction = defineFunction({
  name: 'job-resume-analyzer-api',
  entry: '../../../backend/src/lambda.ts',
  runtime: 18,
  timeoutSeconds: 30,
  memoryMB: 1024,
  environment: {
    NODE_ENV: 'production',
  },
});
