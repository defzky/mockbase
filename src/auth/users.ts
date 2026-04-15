import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import type { User } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(__dirname, '../../data/tables/users.json');

function ensureFile(): void {
  const dir = join(USERS_FILE, '..');
  if (!existsSync(dir)) {
    import('fs').then(({ mkdirSync }) => mkdirSync(dir, { recursive: true }));
  }
  if (!existsSync(USERS_FILE)) {
    writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

function readUsers(): User[] {
  ensureFile();
  const data = readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users: User[]): void {
  ensureFile();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.id === id);
}

export function createUser(email: string, passwordHash: string): User {
  const users = readUsers();
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    email: email.toLowerCase(),
    password_hash: passwordHash,
    created_at: now,
    updated_at: now
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function emailExists(email: string): boolean {
  return findUserByEmail(email) !== undefined;
}
