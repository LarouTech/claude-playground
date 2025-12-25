import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { apiFunction } from './functions/api/resource';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * AWS Amplify Gen 2 Backend Configuration
 * Defines the serverless backend resources for the Job Resume Analyzer
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  apiFunction,
});

/**
 * Configure environment variables and permissions for the API function
 */
backend.apiFunction.addEnvironment('DYNAMODB_TABLE', backend.data.resources.tables['Resume'].tableName);
backend.apiFunction.addEnvironment('S3_BUCKET', backend.storage.resources.bucket.bucketName);
backend.apiFunction.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);

// Grant the Lambda function permissions to access DynamoDB and S3
backend.storage.resources.bucket.grantReadWrite(backend.apiFunction.resources.lambda);
backend.data.resources.tables['Resume'].grantReadWriteData(backend.apiFunction.resources.lambda);
backend.data.resources.tables['JobPosting'].grantReadWriteData(backend.apiFunction.resources.lambda);
backend.data.resources.tables['AnalysisSession'].grantReadWriteData(backend.apiFunction.resources.lambda);
backend.data.resources.tables['Suggestion'].grantReadWriteData(backend.apiFunction.resources.lambda);

/**
 * Add Function URL for the API Lambda
 * This is the simplest way to expose the NestJS API in Amplify Gen 2
 */
const apiStack = Stack.of(backend.apiFunction.resources.lambda);

// Add Function URL with CORS configuration
const functionUrl = backend.apiFunction.resources.lambda.addFunctionUrl({
  authType: 'NONE', // Public access - authentication is handled by NestJS/Cognito
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
    allowCredentials: true,
  },
});

// Grant Bedrock permissions to the Lambda
backend.apiFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['*'],
  })
);

// Output the Function URL
new CfnOutput(apiStack, 'ApiUrl', {
  value: functionUrl.url,
  description: 'NestJS API Function URL',
});
