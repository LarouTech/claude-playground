import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { CfnOutput, Stack, Duration } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

/**
 * AWS Amplify Gen 2 Backend Configuration
 * Defines the serverless backend resources for the Job Resume Analyzer
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

/**
 * Create Lambda function using CDK directly to avoid bundling issues
 * We use the pre-built backend from backend/dist
 */
const apiStack = Stack.of(backend.data);

const apiFunction = new LambdaFunction(apiStack, 'JobResumeAnalyzerApi', {
  runtime: Runtime.NODEJS_18_X,
  handler: 'dist/lambda.handler',
  code: Code.fromAsset(path.join(__dirname, '../backend'), {
    bundling: {
      image: Runtime.NODEJS_18_X.bundlingImage,
      command: [
        'bash', '-c', [
          'npm ci --production',
          'npm run build',
          'cp -r dist /asset-output/',
          'cp -r node_modules /asset-output/',
          'cp package.json /asset-output/',
        ].join(' && ')
      ],
      user: 'root',
    },
  }),
  timeout: Duration.seconds(30),
  memorySize: 2048,
  environment: {
    NODE_ENV: 'production',
    DYNAMODB_TABLE: backend.data.resources.tables['Resume'].tableName,
    S3_BUCKET: backend.storage.resources.bucket.bucketName,
    USER_POOL_ID: backend.auth.resources.userPool.userPoolId,
  },
});

// Grant the Lambda function permissions to access DynamoDB and S3
backend.storage.resources.bucket.grantReadWrite(apiFunction);
backend.data.resources.tables['Resume'].grantReadWriteData(apiFunction);
backend.data.resources.tables['JobPosting'].grantReadWriteData(apiFunction);
backend.data.resources.tables['AnalysisSession'].grantReadWriteData(apiFunction);
backend.data.resources.tables['Suggestion'].grantReadWriteData(apiFunction);

// Grant Bedrock permissions
apiFunction.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['*'],
  })
);

// Add Function URL with CORS configuration
const functionUrl = apiFunction.addFunctionUrl({
  authType: 'NONE', // Public access - authentication is handled by NestJS/Cognito
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
    allowCredentials: true,
  },
});

// Output the Function URL
new CfnOutput(apiStack, 'ApiUrl', {
  value: functionUrl.url,
  description: 'NestJS API Function URL',
});

export { backend };
