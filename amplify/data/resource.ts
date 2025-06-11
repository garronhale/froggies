import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a
    .model({
      title: a.string().required(),
      description: a.string(),
      completed: a.boolean().default(false),
    })
    .authorization(allow => [
      // Allow all authenticated users to perform all operations
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      
      // Alternatively, you can use this simpler form
      // allow.authenticated()
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
