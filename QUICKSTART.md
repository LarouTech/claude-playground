# Quick Start Guide

Get the Job Resume Analyzer up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- AWS Account (for deployment)
- AWS CLI configured with credentials

## Quick Setup (Development)

### 1. Install Dependencies

```bash
# Install Amplify dependencies
cd amplify
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Set Up Environment

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Backend Locally

```bash
cd backend
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"job-resume-analyzer-backend"}
```

## Testing the Features

### Upload and Parse a Resume

```bash
# Create a test resume file
echo "John Doe
john.doe@email.com | (555) 123-4567

EXPERIENCE
Senior Software Engineer at TechCorp
- Led development of microservices architecture
- Implemented CI/CD pipelines using Jenkins and Docker

SKILLS
Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes

EDUCATION
Bachelor of Science in Computer Science
University of Technology" > test-resume.txt

# Upload via API (you'll need to adjust the userId)
curl -X POST http://localhost:3000/api/resume/upload \
  -F "file=@test-resume.txt" \
  -F "userId=test-user" \
  -F "fileName=test-resume.txt"
```

### Analyze a Job Posting

```bash
curl -X POST http://localhost:3000/api/job/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "jobDescription": "Senior Software Engineer\n\nWe are looking for an experienced engineer with:\n- 5+ years of experience\n- Strong Python and JavaScript skills\n- Experience with React and Node.js\n- AWS and containerization experience\n\nResponsibilities:\n- Design and build scalable systems\n- Lead technical initiatives",
    "jobTitle": "Senior Software Engineer",
    "company": "TechCorp"
  }'
```

### Create a Match Analysis

```bash
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "resumeId": "<resume-id-from-upload>",
    "jobId": "<job-id-from-analyze>"
  }'
```

## Deploying to AWS

### Option 1: Using Amplify Gen 2

```bash
# Initialize Amplify
cd amplify
npm install -g @aws-amplify/cli
amplify init

# Deploy
amplify push
```

### Option 2: Using Serverless Framework

```bash
# Install Serverless globally
npm install -g serverless

# Deploy backend
cd backend
serverless deploy --stage prod

# Note the API Gateway URL from the output
```

## Next Steps

1. **Add Authentication**: Integrate AWS Cognito for user management
2. **Build Frontend**: Create Angular app (see `/frontend` directory when ready)
3. **AI Integration**: Add OpenAI or AWS Bedrock for enhanced suggestions
4. **Set Up CI/CD**: Use GitHub Actions for automated deployments

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/resume/upload` | Upload resume |
| GET | `/api/resume/:userId` | Get user's resumes |
| POST | `/api/job/analyze` | Analyze job posting |
| GET | `/api/job/:userId` | Get user's job postings |
| POST | `/api/match` | Create match analysis |
| GET | `/api/match/:userId/:sessionId` | Get match results |
| GET | `/api/suggestions/session/:sessionId` | Get suggestions |
| POST | `/api/cover-letter/generate` | Generate cover letter |

## Troubleshooting

### Backend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### AWS deployment fails
- Verify AWS credentials: `aws sts get-caller-identity`
- Check IAM permissions for Lambda, DynamoDB, and S3

### Database errors
- Ensure DynamoDB table exists (created by Serverless)
- Check AWS region matches in .env and serverless.yml

## Development Tips

1. **Hot Reload**: Backend uses `npm run start:dev` for auto-reload
2. **Testing**: Run `npm test` in backend directory
3. **Linting**: Run `npm run lint` to check code quality
4. **Logs**: Check CloudWatch logs for deployed functions

## Support

- See full documentation in README.md
- Check GitHub Issues for known problems
- AWS documentation: https://docs.aws.amazon.com/

Happy job hunting! 🚀
