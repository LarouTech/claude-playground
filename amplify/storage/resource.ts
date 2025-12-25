import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 Storage configuration for resume and job posting uploads
 */
export const storage = defineStorage({
  name: 'jobResumeUploads',
  access: (allow) => ({
    'resumes/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'job-postings/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'cover-letters/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
