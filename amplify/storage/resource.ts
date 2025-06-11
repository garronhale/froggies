import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'todostorage',
  access: (allow) => {
    allow.authenticated();
  },
});
