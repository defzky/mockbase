export interface QueryParams {
  select?: string;
  insert?: Record<string, unknown>;
  update?: Record<string, unknown>;
  delete?: number;
  eq?: Record<string, string | number | boolean>;
  neq?: Record<string, string | number | boolean>;
  gt?: Record<string, string | number>;
  gte?: Record<string, string | number>;
  lt?: Record<string, string | number>;
  lte?: Record<string, string | number>;
  like?: Record<string, string>;
  ilike?: Record<string, string>;
  in?: Record<string, (string | number)[]>;
  is?: Record<string, null | boolean>;
  order?: string;
  limit?: number;
  offset?: number;
  count?: 'exact' | 'planned' | 'estimated';
}

export interface TableRow {
  id: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface QueryResult<T> {
  data: T[];
  count?: number;
  error?: string;
}

export interface SingleResult<T> {
  data: T | null;
  error?: string;
}

export interface RLSContext {
  userId: string | null;
  authHeader?: string;
}
