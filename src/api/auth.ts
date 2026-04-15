import { Hono } from 'hono';
import { signup, login, authenticate } from '../auth/index.js';

const auth = new Hono();

auth.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const result = await signup(body);
    return c.json(result, 200);
  } catch (error) {
    return c.json({ error: String(error) }, 400);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const result = await login(body);
    return c.json(result, 200);
  } catch (error) {
    return c.json({ error: String(error) }, 401);
  }
});

auth.get('/me', (c) => {
  const authHeader = c.req.header('Authorization');
  const payload = authenticate(authHeader);
  
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  return c.json({ id: payload.sub, email: payload.email });
});

export default auth;
