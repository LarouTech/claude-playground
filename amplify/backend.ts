import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * AWS Amplify Gen 2 Backend Configuration
 * Defines the serverless backend resources for the Job Resume Analyzer
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
});
