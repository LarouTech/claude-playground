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
│   └── package.json
│
├── amplify/                  # AWS Amplify Gen 2 configuration
│   ├── auth/                 # Cognito authentication
│   ├── data/                 # DynamoDB schema (AppSync)
│   ├── storage/              # S3 storage configuration
│   ├── functions/
│   │   └── api/              # NestJS API Lambda function
│   └── backend.ts            # Main Amplify backend definition
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
- AWS CLI configured with credentials (for deployment)
- AWS Amplify Gen 2 CLI (installed via npx, no global install needed)

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

### 3. Set up environment variables

Create a `.env` file in the backend directory:

```bash
# Backend environment
cp backend/.env.example backend/.env
```

Update with your configuration (AWS credentials are not needed locally - they'll be used in deployment):

```
# AI Provider Configuration
USE_BEDROCK=true
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
OPENAI_API_KEY=your-openai-key  # Only if USE_BEDROCK=false
```

### 4. Run locally

```bash
# Run frontend (http://localhost:4200)
cd frontend
npm start

# Run backend locally
cd backend
npm run start:dev

# Or use Amplify sandbox for full cloud-connected development
cd amplify
npx ampx sandbox
```

## Deployment

### Prerequisites

1. AWS Account with credentials configured
2. GitHub repository set up with the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (optional, defaults to us-east-1)
   - `OPENAI_API_KEY` (optional, if not using Bedrock)
   - `USE_BEDROCK` (optional, defaults to true)
   - `BEDROCK_MODEL_ID` (optional)

### Deploy with Amplify Gen 2

```bash
# Install Amplify dependencies
cd amplify
npm install

# Deploy to AWS
npx ampx sandbox  # For development environment with hot reload
# OR
npx ampx deploy --branch main  # For production deployment
```

The deployment will:
- Create DynamoDB tables for data storage
- Set up S3 buckets for file uploads
- Deploy the NestJS backend as a Lambda function
- Configure Cognito for authentication
- Set up API Gateway with Function URLs
- Deploy the Angular frontend to Amplify Hosting

After deployment, Amplify will output the API URL and frontend URL.

### Deploy with GitHub Actions

Push to the `main` branch and GitHub Actions will automatically:
1. Run backend tests
2. Build the backend
3. Deploy everything to AWS using Amplify Gen 2

The deployment is fully automated via `.github/workflows/ci-cd.yml`.

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

### Backend (`backend/.env`)

```
# AI Provider Configuration
USE_BEDROCK=true
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Optional: OpenAI API (if not using Bedrock)
OPENAI_API_KEY=your-openai-key
```

### Amplify Outputs

After deploying with Amplify Gen 2, you'll get:
- API Function URL (REST API endpoint)
- Cognito User Pool ID
- S3 Bucket names
- DynamoDB table names

These are automatically configured via Amplify outputs and don't need manual environment variables.

## Architecture

### AWS Amplify Gen 2 Stack
- **Frontend**: Angular 21 hosted on Amplify Hosting
- **Backend**: NestJS running as AWS Lambda function
- **API**: Lambda Function URL (no API Gateway needed)
- **Database**: DynamoDB with AppSync schema
- **Storage**: S3 for resume and document uploads
- **Auth**: Amazon Cognito User Pools
- **AI**: AWS Bedrock (Claude) or OpenAI API

### Frontend Flow
1. User uploads resume and job posting
2. Files sent to S3 via Amplify Storage
3. API calls to Lambda Function URL
4. Results displayed in Angular UI

### Backend Flow
1. Lambda receives Function URL request
2. NestJS processes request via serverless-express
3. Resume/Job parsed and analyzed
4. AI (Bedrock/OpenAI) generates suggestions and cover letter
5. Results stored in DynamoDB
6. Response returned to frontend

### Deployment Flow
1. Code pushed to GitHub
2. GitHub Actions triggers
3. `ampx deploy` provisions all AWS resources via CDK
4. Lambda function deployed with NestJS backend
5. Frontend built and deployed to Amplify Hosting

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
