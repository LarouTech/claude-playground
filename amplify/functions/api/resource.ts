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
  bundling: {
    // Mark all dependencies as external - they'll be included from node_modules
    externalModules: [
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/platform-express',
      '@nestjs/config',
      '@vendia/serverless-express',
      'express',
      '@aws-sdk/client-bedrock-runtime',
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/client-s3',
      '@aws-sdk/lib-dynamodb',
      '@aws-sdk/s3-request-presigner',
      'class-transformer',
      'class-validator',
      'mammoth',
      'multer',
      'openai',
      'pdf-parse',
      'rxjs',
      'uuid',
      'aws-lambda',
    ],
    // Include node_modules in the deployment package
    nodeModules: [
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/platform-express',
      '@nestjs/config',
      '@vendia/serverless-express',
      'express',
      '@aws-sdk/client-bedrock-runtime',
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/client-s3',
      '@aws-sdk/lib-dynamodb',
      '@aws-sdk/s3-request-presigner',
      'class-transformer',
      'class-validator',
      'mammoth',
      'multer',
      'openai',
      'pdf-parse',
      'rxjs',
      'uuid',
      'aws-lambda',
    ],
  },
});
