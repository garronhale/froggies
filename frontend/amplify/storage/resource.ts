import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'todostorage',  // This will be used as part of your bucket name
  access: (allow) => {
    allow.authenticated();  // Allow authenticated users to access storage
  },
});
