import jwt from 'jsonwebtoken';
import type { AuthPayload } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'local-supabase-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
