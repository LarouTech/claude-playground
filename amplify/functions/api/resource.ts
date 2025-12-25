import { defineFunction } from '@aws-amplify/backend';

/**
 * NestJS REST API Lambda Function
 * Uses symlink to backend/src for source files
 * Dependencies are installed from package.json in this directory
 */
export const apiFunction = defineFunction({
  name: 'job-resume-analyzer-api',
  entry: './src/lambda.ts',
  runtime: 18,
  timeoutSeconds: 30,
  memoryMB: 2048,
  environment: {
    NODE_ENV: 'production',
  },
});
