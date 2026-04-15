import { serve } from '@hono/node-server';
import app from './api/index.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

console.log(`Starting local-supabase server on port ${PORT}...`);

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Server running at http://localhost:${PORT}`);
console.log(`API Endpoints:`);
console.log(`  GET  /                      - Server info`);
console.log(`  GET  /health                - Health check`);
console.log(`  POST /auth/v1/signup        - Register user`);
console.log(`  POST /auth/v1/login         - Login user`);
console.log(`  GET  /auth/v1/me            - Get current user`);
console.log(`  GET  /rest/v1/:table        - Select rows`);
console.log(`  POST /rest/v1/:table        - Insert rows`);
console.log(`  PATCH /rest/v1/:table/:id   - Update row`);
console.log(`  PUT  /rest/v1/:table/:id    - Replace row`);
console.log(`  DELETE /rest/v1/:table/:id  - Delete row`);
