import { Hono } from 'hono';
import { authenticate } from '../auth/index.js';
import { select, insert, update, remove, tableExists } from '../database/index.js';
import type { QueryParams, RLSContext } from '../database/types.js';

const rest = new Hono();

function parseQueryParams(urlStr: string): QueryParams {
  const url = new URL(urlStr);
  const params: QueryParams = {};
  
  const selectParam = url.searchParams.get('select');
  if (selectParam) params.select = selectParam;
  
  const orderParam = url.searchParams.get('order');
  if (orderParam) params.order = orderParam;
  
  const limitParam = url.searchParams.get('limit');
  if (limitParam) params.limit = parseInt(limitParam, 10);
  
  const offsetParam = url.searchParams.get('offset');
  if (offsetParam) params.offset = parseInt(offsetParam, 10);
  
  for (const [key, value] of url.searchParams) {
    if (key.startsWith('eq.')) {
      params.eq = params.eq || {};
      params.eq[key.slice(3)] = value;
    } else if (key.startsWith('neq.')) {
      params.neq = params.neq || {};
      params.neq[key.slice(4)] = value;
    } else if (key.startsWith('gt.')) {
      params.gt = params.gt || {};
      params.gt[key.slice(3)] = value;
    } else if (key.startsWith('gte.')) {
      params.gte = params.gte || {};
      params.gte[key.slice(4)] = value;
    } else if (key.startsWith('lt.')) {
      params.lt = params.lt || {};
      params.lt[key.slice(3)] = value;
    } else if (key.startsWith('lte.')) {
      params.lte = params.lte || {};
      params.lte[key.slice(4)] = value;
    } else if (key.startsWith('like.')) {
      params.like = params.like || {};
      params.like[key.slice(5)] = value;
    } else if (key.startsWith('ilike.')) {
      params.ilike = params.ilike || {};
      params.ilike[key.slice(6)] = value;
    } else if (key.startsWith('in.')) {
      params.in = params.in || {};
      params.in[key.slice(3)] = value.split(',');
    } else if (key.startsWith('is.')) {
      params.is = params.is || {};
      params.is[key.slice(3)] = value === 'null' ? null : value === 'true';
    }
  }
  
  return params;
}

function getRLSContext(authHeader?: string): RLSContext {
  const payload = authenticate(authHeader);
  return {
    userId: payload?.sub || null,
    authHeader
  };
}

rest.get('/:table', async (c) => {
  const table = c.req.param('table');
  const authHeader = c.req.header('Authorization');
  const params = parseQueryParams(c.req.url);
  
  if (!tableExists(table)) {
    return c.json({ error: `Table '${table}' not found` }, 400);
  }
  
  const context = getRLSContext(authHeader);
  const result = select(table, params, context);
  
  if (result.error) {
    return c.json({ error: result.error }, 500);
  }
  
  return c.json(result.data);
});

rest.post('/:table', async (c) => {
  const table = c.req.param('table');
  const authHeader = c.req.header('Authorization');
  
  if (!tableExists(table)) {
    return c.json({ error: `Table '${table}' not found` }, 400);
  }
  
  try {
    const body = await c.req.json();
    const data = Array.isArray(body) ? body : [body];
    const context = getRLSContext(authHeader);
    const result = insert(table, data, context);
    
    if (result.error) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json(result.data, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 400);
  }
});

rest.patch('/:table/:id', async (c) => {
  const table = c.req.param('table');
  const id = c.req.param('id');
  const authHeader = c.req.header('Authorization');
  
  if (!tableExists(table)) {
    return c.json({ error: `Table '${table}' not found` }, 400);
  }
  
  try {
    const body = await c.req.json();
    const context = getRLSContext(authHeader);
    const result = update(table, id, body, context);
    
    if (result.error) {
      return c.json({ error: result.error }, result.error === 'Row not found' ? 404 : 500);
    }
    
    if (result.data.length === 0) {
      return c.json({ error: 'Row not found' }, 404);
    }
    
    return c.json(result.data[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 400);
  }
});

rest.put('/:table/:id', async (c) => {
  const table = c.req.param('table');
  const id = c.req.param('id');
  const authHeader = c.req.header('Authorization');
  
  if (!tableExists(table)) {
    return c.json({ error: `Table '${table}' not found` }, 400);
  }
  
  try {
    const body = await c.req.json();
    const context = getRLSContext(authHeader);
    const result = update(table, id, body, context);
    
    if (result.error) {
      return c.json({ error: result.error }, result.error === 'Row not found' ? 404 : 500);
    }
    
    if (result.data.length === 0) {
      return c.json({ error: 'Row not found' }, 404);
    }
    
    return c.json(result.data[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 400);
  }
});

rest.delete('/:table/:id', async (c) => {
  const table = c.req.param('table');
  const id = c.req.param('id');
  const authHeader = c.req.header('Authorization');
  
  if (!tableExists(table)) {
    return c.json({ error: `Table '${table}' not found` }, 400);
  }
  
  const context = getRLSContext(authHeader);
  const result = remove(table, id, context);
  
  if (result.error) {
    return c.json({ error: result.error }, result.error === 'Row not found' ? 404 : 500);
  }
  
  return c.json(result.data[0], 200);
});

export default rest;
