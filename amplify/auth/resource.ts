import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    // You can uncomment the following lines to enable additional login methods
    // phone: true,
    // username: true,
  },
  // Uncomment the following lines to enable MFA
  // multifactor: {
  //   mode: 'OPTIONAL',
  //   sms: true,
  //   totp: true,
  // },
});