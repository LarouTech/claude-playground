# Job Resume Analyzer

An intelligent serverless application that analyzes job postings against your resume, provides actionable suggestions, tracks acknowledgements, and helps you write personalized cover letters.

## Tech Stack

### Frontend
- **Framework**: Angular 21 (latest)
- **Styling**: Tailwind CSS v4 (latest)
- **Testing**: Jasmine & Karma

### Backend
- **Framework**: NestJS
- **Architecture**: Serverless (AWS Lambda)
- **Testing**: Jest

### Cloud Infrastructure (AWS)
- **Platform**: AWS Amplify Gen 2
- **Compute**: AWS Lambda
- **API**: Amazon API Gateway
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **AI**: Amazon Bedrock (Claude) or OpenAI API

### CI/CD
- **Platform**: GitHub Actions

## Features

- **Resume Upload & Analysis**: Upload resumes (PDF, DOCX, TXT) and extract key information
- **Job Posting Analyzer**: Paste or upload job descriptions and extract requirements
- **Smart Matching**: AI-powered comparison between resume and job requirements
- **Gap Analysis**: Identify missing skills and qualifications
- **Suggestion System**: Get actionable suggestions to improve your application
- **Acknowledgement Tracking**: Mark suggestions as implemented and track progress
- **Cover Letter Generator**: AI-generated personalized cover letters
- **History**: View past analyses and track application improvements

## Project Structure

```
.
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI components
│   │   │   ├── services/     # API services
│   │   │   ├── models/       # TypeScript interfaces
│   │   │   └── pages/        # Page components
│   │   ├── assets/
│   │   └── styles/           # Tailwind CSS v4 (CSS-based config)
│   ├── angular.json
│   └── package.json
│
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── resume/       # Resume parsing & analysis
│   │   │   ├── job/          # Job posting analysis
│   │   │   ├── matcher/      # Matching algorithm
│   │   │   ├── suggestions/  # Suggestion engine
│   │   │   ├── cover-letter/ # Cover letter generation
│   │   │   └── storage/      # DynamoDB & S3 integration
│   │   ├── common/
│   │   └── lambda.ts         # Lambda handler
│   ├── serverless.yml        # Serverless Framework config
│   └── package.json
│
├── amplify/                  # AWS Amplify Gen 2 configuration
│   ├── auth/
│   ├── data/
│   ├── storage/
│   └── backend.ts
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions workflow
│
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`
- NestJS CLI: `npm install -g @nestjs/cli`
- AWS CLI configured with credentials
- Amplify CLI: `npm install -g @aws-amplify/cli`

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd job-resume-analyzer
```

### 2. Install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Configure AWS Amplify

```bash
# Initialize Amplify
amplify init

# Deploy backend resources
amplify push
```

### 4. Set up environment variables

```bash
# Frontend environment
cp frontend/src/environments/environment.example.ts frontend/src/environments/environment.ts

# Backend environment
cp backend/.env.example backend/.env
```

Update the environment files with your AWS resources and API keys.

### 5. Run locally

```bash
# Run frontend (http://localhost:4200)
cd frontend
npm start

# Run backend locally with Serverless Offline
cd backend
npm run start:dev
```

## Deployment

### Deploy with Amplify

```bash
# Deploy frontend and backend
amplify publish
```

### Deploy with GitHub Actions

Push to the main branch and GitHub Actions will automatically deploy to AWS.

## Testing

```bash
# Frontend tests (Jasmine/Karma)
cd frontend
npm test

# Backend tests (Jest)
cd backend
npm test

# E2E tests
npm run test:e2e
```

## Usage

1. **Upload Resume**: Upload your resume in PDF, DOCX, or TXT format
2. **Add Job Posting**: Paste or upload the job description
3. **Analyze Match**: Click "Analyze" to compare resume against job requirements
4. **Review Suggestions**: Get AI-powered suggestions to improve your application
5. **Acknowledge**: Mark suggestions as you implement them
6. **Generate Cover Letter**: Create a personalized cover letter
7. **Track Progress**: View your application history and improvements

## API Endpoints

- `POST /api/resume/upload` - Upload and parse resume
- `POST /api/job/analyze` - Analyze job posting
- `POST /api/match` - Compare resume against job
- `GET /api/suggestions/:sessionId` - Get suggestions
- `POST /api/suggestions/:id/acknowledge` - Mark suggestion as implemented
- `POST /api/cover-letter/generate` - Generate cover letter
- `GET /api/history` - Get analysis history

## Environment Variables

### Frontend (`frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-api-gateway-url',
  aws: {
    region: 'us-east-1',
    userPoolId: 'your-user-pool-id',
    userPoolWebClientId: 'your-client-id',
  }
};
```

### Backend (`backend/.env`)

```
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=job-resume-analyzer
S3_BUCKET_NAME=job-resume-uploads
OPENAI_API_KEY=your-openai-key
# OR use AWS Bedrock
USE_BEDROCK=true
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

## Architecture

### Frontend Flow
1. User uploads resume and job posting
2. Files sent to S3 via pre-signed URLs
3. API calls trigger Lambda functions
4. Results displayed in Angular UI

### Backend Flow
1. Lambda receives API Gateway request
2. NestJS processes request
3. Resume/Job parsed and analyzed
4. AI generates suggestions and cover letter
5. Results stored in DynamoDB
6. Response returned to frontend

## Cost Optimization

- **Lambda**: Pay only for compute time used
- **DynamoDB**: On-demand pricing for variable workloads
- **S3**: Lifecycle policies to archive old uploads
- **API Gateway**: Caching enabled for common requests
- **Amplify**: Free tier covers development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
