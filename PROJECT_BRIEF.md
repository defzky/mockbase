# MockBase - JSON-based Backend for Development

**Created:** 2026-04-15
**Purpose:** Local development backend with JSON file storage (Supabase-like API)
**Project Name:** MockBase

---

## 🎯 Objectives

Build a **Supabase-like backend** that uses **JSON files** for local development:
- ✅ Authentication (email/password, JWT)
- ✅ CRUD operations on JSON "tables"
- ✅ Row-Level Security (RLS) simulation
- ✅ Real-time subscriptions (optional)
- ✅ Simple setup for local development

---

## 📁 Project Structure

```
local-supabase/
├── src/
│   ├── auth/              # Authentication
│   │   ├── index.ts
│   │   ├── jwt.ts
│   │   └── users.json
│   ├── database/          # JSON Database
│   │   ├── index.ts
│   │   ├── tables/
│   │   │   ├── users.json
│   │   │   ├── profiles.json
│   │   │   └── quests.json
│   │   └── rls.ts
│   ├── api/               # REST API
│   │   ├── routes/
│   │   └── middleware.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js or Bun
- **Language:** TypeScript
- **Framework:** Hono (lightweight, fast) or Express
- **Auth:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Watch:** chokidar (for real-time)

---

## 🔧 Features to Build

### Phase 1: Core (MVP)
- [ ] JSON file database (CRUD operations)
- [ ] User authentication (signup, login)
- [ ] JWT token generation/validation
- [ ] REST API endpoints
- [ ] Basic RLS (user can only access own data)

### Phase 2: Advanced
- [ ] Real-time subscriptions (file watching)
- [ ] Query language (filter, sort, limit)
- [ ] Relationships (foreign keys simulation)
- [ ] Transactions (atomic writes)
- [ ] Backup/restore

### Phase 3: Supabase Compatibility
- [ ] Supabase JS client compatibility layer
- [ ] Same API as Supabase
- [ ] Easy migration to real Supabase later

---

## 📊 Example Usage

```typescript
// Client-side (same as Supabase)
import { createClient } from '@local-supabase/client';

const supabase = createClient('http://localhost:3000', 'anon-key');

// Auth
const { user, session } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Database
const { data, error } = await supabase
  .from('quests')
  .select('*')
  .eq('user_id', user.id);

// Real-time
supabase
  .channel('quests')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'quests' }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

---

## 🔒 Security Considerations

- JWT secret stored in `.env`
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation
- File permissions

---

## 📈 Limitations (By Design)

- ❌ Not for production (JSON files don't scale)
- ❌ No concurrent writes (file locking issues)
- ❌ No ACID transactions
- ❌ Limited to single user/machine
- ✅ Perfect for local development & prototyping

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Create initial JSON files
npm run init

# Start server
npm run dev

# Server runs on http://localhost:3000
```

---

## 📝 JSON Database Format

```json
// users.json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "password_hash": "bcrypt-hash",
      "created_at": "2026-04-15T00:00:00Z"
    }
  ]
}

// quests.json
{
  "quests": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "title": "Complete task",
      "completed": false,
      "created_at": "2026-04-15T00:00:00Z"
    }
  ]
}
```

---

## 🎯 Success Criteria

- [ ] Can signup/login users
- [ ] Can CRUD data to JSON files
- [ ] RLS works (users can't access others' data)
- [ ] API matches Supabase interface
- [ ] Can be used with Task Slayer app locally

---

**Status:** 🚧 Planning
**Next:** Initialize project with Opencode
