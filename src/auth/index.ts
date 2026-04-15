import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, emailExists } from './users.js';
import { generateToken, verifyToken, extractTokenFromHeader } from './jwt.js';
import type { SignupRequest, LoginRequest, AuthResponse, AuthPayload } from './types.js';

const SALT_ROUNDS = 10;

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }
  
  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  if (emailExists(data.email)) {
    throw new Error('Email already registered');
  }
  
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = createUser(data.email, passwordHash);
  const token = generateToken(user.id, user.email);
  
  const { password_hash: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token
  };
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }
  
  const user = findUserByEmail(data.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken(user.id, user.email);
  const { password_hash: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
}

export function authenticate(authHeader: string | undefined): AuthPayload | null {
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

export * from './types.js';
