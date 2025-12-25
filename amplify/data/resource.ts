import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data schema using AWS AppSync and DynamoDB
 */
const schema = a.schema({
  // Resume data model
  Resume: a
    .model({
      userId: a.string().required(),
      fileName: a.string().required(),
      s3Key: a.string().required(),
      parsedData: a.json().required(),
      skills: a.string().array(),
      experience: a.string().array(),
      education: a.string().array(),
      uploadedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // Job posting data model
  JobPosting: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      company: a.string(),
      location: a.string(),
      description: a.string().required(),
      parsedData: a.json().required(),
      requiredSkills: a.string().array(),
      preferredSkills: a.string().array(),
      requirements: a.string().array(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // Analysis session
  AnalysisSession: a
    .model({
      userId: a.string().required(),
      resumeId: a.string().required(),
      jobPostingId: a.string().required(),
      matchScore: a.float(),
      matchData: a.json(),
      suggestions: a.hasMany('Suggestion', 'sessionId'),
      coverLetter: a.string(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // Suggestion tracking
  Suggestion: a
    .model({
      sessionId: a.string().required(),
      session: a.belongsTo('AnalysisSession', 'sessionId'),
      category: a.string().required(), // 'skill', 'experience', 'education', 'formatting'
      title: a.string().required(),
      description: a.string().required(),
      priority: a.enum(['high', 'medium', 'low']),
      acknowledged: a.boolean().default(false),
      acknowledgedAt: a.datetime(),
      implementationNotes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
