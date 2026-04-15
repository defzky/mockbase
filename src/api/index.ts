import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './auth.js';
import restRoutes from './rest.js';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'Prefer'],
}));

app.get('/', (c) => c.json({
  name: 'local-supabase',
  version: '1.0.0',
  status: 'running'
}));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/auth/v1', authRoutes);
app.route('/rest/v1', restRoutes);

export default app;
