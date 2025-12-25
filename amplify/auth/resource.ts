import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication configuration using Amazon Cognito
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to Job Resume Analyzer!',
      verificationEmailBody: (createCode) =>
        `Your verification code is ${createCode()}`,
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    givenName: {
      required: false,
      mutable: true,
    },
    familyName: {
      required: false,
      mutable: true,
    },
  },
});
