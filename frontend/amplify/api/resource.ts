import { defineData } from '@aws-amplify/backend';
import { type ClientSchema } from '@aws-amplify/data-schema';

// Define your GraphQL schema
const schema = {
  Todo: {
    primaryIndex: { partitionKey: 'id' },
    fields: {
      id: {
        type: 'ID',
        isRequired: true,
      },
      title: {
        type: 'String',
        isRequired: true,
      },
      description: {
        type: 'String',
      },
      completed: {
        type: 'Boolean',
        defaultValue: false,
      },
      createdAt: {
        type: 'AWSDateTime',
        isReadOnly: true,
      },
      updatedAt: {
        type: 'AWSDateTime',
        isReadOnly: true,
      },
    },
  },
} satisfies ClientSchema;

// Create the API
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
