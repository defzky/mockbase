import app from '../src/api/index.js';

// Vercel serverless function handler
export default app;

// For edge runtime compatibility
export const config = {
  runtime: 'nodejs',
  regions: ['iad1'],
};
