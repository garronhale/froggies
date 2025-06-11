import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';

console.log('Loading Amplify configuration:', config);

// Check if storage configuration exists
if (!config.storage || !config.storage.S3) {
  console.warn('Storage configuration is missing in amplifyconfiguration.json');
  
  // Add a default storage configuration
  config.storage = {
    S3: {
      bucket: 'amplify-storage-bucket',
      region: 'us-east-1'
    }
  };
  
  console.log('Added default storage configuration:', config.storage);
}

Amplify.configure(config);
