import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { CfnOutput, Stack, Duration } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction, Runtime, Code, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { HttpMethod } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Create Lambda function using CDK directly
 * Uses pre-built backend from backend/dist (no Docker required)
 */
const apiStack = Stack.of(backend.data);

// Build backend before deployment
import { execSync } from 'child_process';
const backendPath = path.join(__dirname, '../backend');

console.log('Building NestJS backend...');
try {
  execSync('npm run build', { cwd: backendPath, stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build backend:', error);
  throw error;
}

const apiFunction = new LambdaFunction(apiStack, 'JobResumeAnalyzerApi', {
  runtime: Runtime.NODEJS_18_X,
  handler: 'dist/lambda.handler',
  code: Code.fromAsset(backendPath, {
    // Exclude dev dependencies and source files to reduce package size
    exclude: [
      'src',
      'test',
      'node_modules/@types',
      '*.ts',
      'tsconfig.json',
      '.env*',
    ],
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
  authType: FunctionUrlAuthType.NONE, // Public access - authentication is handled by NestJS/Cognito
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [
      HttpMethod.GET,
      HttpMethod.POST,
      HttpMethod.PUT,
      HttpMethod.DELETE,
      HttpMethod.PATCH,
      HttpMethod.OPTIONS
    ],
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
