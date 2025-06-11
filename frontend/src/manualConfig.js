import { Amplify } from 'aws-amplify';

// Replace these values with your actual values from the AWS Console
const manualConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_USER_POOL_CLIENT_ID',
      identityPoolId: 'YOUR_IDENTITY_POOL_ID',
      region: 'us-east-1'
    }
  },
  Storage: {
    S3: {
      bucket: 'YOUR_S3_BUCKET_NAME',
      region: 'us-east-1'
    }
  }
};

// To use this manual configuration, uncomment the line below
// and comment out the import in amplifyConfig.js
// Amplify.configure(manualConfig);

export default manualConfig;
