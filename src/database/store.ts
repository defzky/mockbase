import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import type { TableRow, QueryResult, QueryParams, RLSContext } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TABLES_DIR = join(__dirname, '../../data/tables');

function getTablePath(table: string): string {
  return join(TABLES_DIR, `${table}.json`);
}

function ensureTable(table: string): void {
  const dir = TABLES_DIR;
  if (!existsSync(dir)) {
    import('fs').then(({ mkdirSync }) => mkdirSync(dir, { recursive: true }));
  }
  const path = getTablePath(table);
  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify([], null, 2));
  }
}

function readTable(table: string): TableRow[] {
  ensureTable(table);
  const data = readFileSync(getTablePath(table), 'utf-8');
  return JSON.parse(data);
}

function writeTable(table: string, rows: TableRow[]): void {
  ensureTable(table);
  writeFileSync(getTablePath(table), JSON.stringify(rows, null, 2));
}

function applyRLS(rows: TableRow[], context: RLSContext): TableRow[] {
  if (context.userId) {
    return rows.filter(row => row.user_id === context.userId);
  }
  return rows;
}

function applyFilters(rows: TableRow[], params: QueryParams): TableRow[] {
  let filtered = [...rows];

  if (params.eq) {
    for (const [key, value] of Object.entries(params.eq)) {
      filtered = filtered.filter(row => row[key] === value);
    }
  }

  if (params.neq) {
    for (const [key, value] of Object.entries(params.neq)) {
      filtered = filtered.filter(row => row[key] !== value);
    }
  }

  if (params.gt) {
    for (const [key, value] of Object.entries(params.gt)) {
      filtered = filtered.filter(row => {
        const val = row[key];
        return val != null && val > value;
      });
    }
  }

  if (params.gte) {
    for (const [key, value] of Object.entries(params.gte)) {
      filtered = filtered.filter(row => {
        const val = row[key];
        return val != null && val >= value;
      });
    }
  }

  if (params.lt) {
    for (const [key, value] of Object.entries(params.lt)) {
      filtered = filtered.filter(row => {
        const val = row[key];
        return val != null && val < value;
      });
    }
  }

  if (params.lte) {
    for (const [key, value] of Object.entries(params.lte)) {
      filtered = filtered.filter(row => {
        const val = row[key];
        return val != null && val <= value;
      });
    }
  }

  if (params.like) {
    for (const [key, pattern] of Object.entries(params.like)) {
      const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
      filtered = filtered.filter(row => {
        const val = row[key];
        return typeof val === 'string' && regex.test(val);
      });
    }
  }

  if (params.ilike) {
    for (const [key, pattern] of Object.entries(params.ilike)) {
      const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
      filtered = filtered.filter(row => {
        const val = row[key];
        return typeof val === 'string' && regex.test(val);
      });
    }
  }

  if (params.in) {
    for (const [key, values] of Object.entries(params.in)) {
      filtered = filtered.filter(row => values.includes(row[key] as string | number));
    }
  }

  if (params.is) {
    for (const [key, value] of Object.entries(params.is)) {
      filtered = filtered.filter(row => row[key] === value);
    }
  }

  return filtered;
}

function applyOrdering(rows: TableRow[], order?: string): TableRow[] {
  if (!order) return rows;
  
  const [column, direction = 'asc'] = order.split('.');
  return [...rows].sort((a, b) => {
    const valA = a[column];
    const valB = b[column];
    
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA === valB) return 0;
    
    const comparison = valA < valB ? -1 : 1;
    return direction === 'desc' ? -comparison : comparison;
  });
}

function applyPagination(rows: TableRow[], params: QueryParams): TableRow[] {
  let result = rows;
  
  if (params.offset) {
    result = result.slice(params.offset);
  }
  
  if (params.limit) {
    result = result.slice(0, params.limit);
  }
  
  return result;
}

function selectColumns(rows: TableRow[], select?: string): TableRow[] {
  if (!select || select === '*') return rows;
  
  const columns = select.split(',').map(c => c.trim());
  return rows.map(row => {
    const selected: Partial<TableRow> = {};
    for (const col of columns) {
      if (col in row) {
        selected[col] = row[col];
      }
    }
    return selected as TableRow;
  });
}

export function select(
  table: string,
  params: QueryParams,
  context: RLSContext
): QueryResult<TableRow> {
  try {
    let rows = readTable(table);
    rows = applyRLS(rows, context);
    rows = applyFilters(rows, params);
    rows = applyOrdering(rows, params.order);
    rows = applyPagination(rows, params);
    rows = selectColumns(rows, params.select);
    
    return { data: rows, count: rows.length };
  } catch (error) {
    return { data: [], error: String(error) };
  }
}

export function insert(
  table: string,
  data: Record<string, unknown>[],
  context: RLSContext
): QueryResult<TableRow> {
  try {
    const rows = readTable(table);
    const now = new Date().toISOString();
    const newRows: TableRow[] = data.map(item => ({
      id: randomUUID(),
      ...(context.userId && { user_id: context.userId }),
      ...item,
      created_at: now,
      updated_at: now
    }));
    
    rows.push(...newRows);
    writeTable(table, rows);
    
    return { data: newRows };
  } catch (error) {
    return { data: [], error: String(error) };
  }
}

export function update(
  table: string,
  id: string,
  data: Record<string, unknown>,
  context: RLSContext
): QueryResult<TableRow> {
  try {
    let rows = readTable(table);
    rows = applyRLS(rows, context);
    
    const index = rows.findIndex(row => row.id === id);
    if (index === -1) {
      return { data: [], error: 'Row not found' };
    }
    
    const fullRows = readTable(table);
    const fullIndex = fullRows.findIndex(row => row.id === id);
    
    fullRows[fullIndex] = {
      ...fullRows[fullIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    writeTable(table, fullRows);
    
    return { data: [fullRows[fullIndex]] };
  } catch (error) {
    return { data: [], error: String(error) };
  }
}

export function remove(
  table: string,
  id: string,
  context: RLSContext
): QueryResult<TableRow> {
  try {
    const rows = readTable(table);
    const index = rows.findIndex(row => row.id === id);
    
    if (index === -1) {
      return { data: [], error: 'Row not found' };
    }
    
    if (context.userId && rows[index].user_id !== context.userId) {
      return { data: [], error: 'Row not found' };
    }
    
    const deleted = rows.splice(index, 1)[0];
    writeTable(table, rows);
    
    return { data: [deleted] };
  } catch (error) {
    return { data: [], error: String(error) };
  }
}

export function getById(
  table: string,
  id: string,
  context: RLSContext
): TableRow | null {
  const rows = readTable(table);
  const filtered = applyRLS(rows, context);
  return filtered.find(row => row.id === id) || null;
}

export function tableExists(table: string): boolean {
  return existsSync(getTablePath(table));
}
