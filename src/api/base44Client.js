import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6856d667c9e505c7e36e6d59", 
  requiresAuth: true // Ensure authentication is required for all operations
});
