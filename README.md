# MockBase

**MockBase** - A Supabase-compatible local backend using JSON file storage for development.

## Features

- Supabase-compatible REST API
- JWT authentication (email/password)
- Row-Level Security (RLS) simulation
- File-based JSON storage
- CORS enabled for browser access

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## API Endpoints

### Authentication

```bash
# Register
POST /auth/v1/signup
Content-Type: application/json

{ "email": "user@example.com", "password": "password123" }

# Login
POST /auth/v1/login
Content-Type: application/json

{ "email": "user@example.com", "password": "password123" }

# Get current user
GET /auth/v1/me
Authorization: Bearer <token>
```

### REST API

All endpoints support:
- `select=*` - Select columns
- `eq.column=value` - Filter equals
- `neq.column=value` - Filter not equals
- `gt.column=value` - Greater than
- `gte.column=value` - Greater or equal
- `lt.column=value` - Less than
- `lte.column=value` - Less or equal
- `like.column=pattern%` - Pattern matching
- `order=column.desc` - Ordering
- `limit=10` - Limit results
- `offset=0` - Pagination offset

```bash
# Select (GET with RLS)
GET /rest/v1/profiles
Authorization: Bearer <token>

# Select with filters
GET /rest/v1/quests?eq.user_id=123&order=created_at.desc&limit=10
Authorization: Bearer <token>

# Insert
POST /rest/v1/profiles
Authorization: Bearer <token>
Content-Type: application/json

{ "username": "john", "full_name": "John Doe" }

# Update
PATCH /rest/v1/profiles/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "full_name": "Jane Doe" }

# Delete
DELETE /rest/v1/profiles/:id
Authorization: Bearer <token>
```

## Row-Level Security (RLS)

Tables with a `user_id` column automatically enforce RLS:
- Authenticated users can only access their own rows
- `user_id` is automatically set on insert
- Users cannot see or modify other users' data

## About MockBase

MockBase provides a Supabase-like API for local development without needing a real database server. Perfect for:
- Rapid prototyping
- Offline development
- Testing without cloud dependencies
- Learning Supabase patterns

## Project Structure

```
src/
├── auth/          # Authentication (signup, login, JWT)
├── database/      # JSON CRUD operations with RLS
├── api/           # HTTP routes
└── index.ts       # Entry point
data/
└── tables/        # JSON storage
    ├── users.json
    ├── profiles.json
    └── quests.json
```

## Environment Variables

```bash
JWT_SECRET=your-secret-key
PORT=3000
```

## Example Usage

```bash
# Start server
npm run dev

# Register
curl -X POST http://localhost:3000/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create profile
curl -X POST http://localhost:3000/rest/v1/profiles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","full_name":"Test User"}'

# Get profiles
curl http://localhost:3000/rest/v1/profiles \
  -H "Authorization: Bearer <token>"
```
