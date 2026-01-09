# Authentication System Implementation

## Overview

A custom-built authentication system for the Kharji expense tracker application. Implements full user authentication from scratch without relying on third-party auth frameworks like NextAuth, Better Auth, or Clerk.

## Features Implemented

### 1. User Management

- ✅ User registration (Sign up)
- ✅ User login with email and password
- ✅ User logout
- ✅ Password reset functionality
- ✅ Forgot password flow
- ✅ Session-based authentication

### 2. Security Features

- ✅ Password hashing using PBKDF2 with salt
- ✅ Session tokens (32 bytes, cryptographically secure)
- ✅ Password reset tokens with expiration (1 hour)
- ✅ Session expiration (30 days)
- ✅ HTTP-only cookies for session storage
- ✅ Password validation requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### 3. Database Schema

New tables created:

#### `users`

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
email TEXT NOT NULL UNIQUE
password_hash TEXT NOT NULL
created_at TEXT DEFAULT CURRENT_TIMESTAMP
updated_at TEXT DEFAULT CURRENT_TIMESTAMP
```

#### `sessions`

```sql
id TEXT PRIMARY KEY
user_id INTEGER NOT NULL
expires_at TEXT NOT NULL
created_at TEXT DEFAULT CURRENT_TIMESTAMP
```

#### `password_reset_tokens`

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL
token TEXT NOT NULL UNIQUE
expires_at TEXT NOT NULL
created_at TEXT DEFAULT CURRENT_TIMESTAMP
```

### 4. API Endpoints

#### Authentication Routes

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current authenticated user

### 5. Frontend Pages

- `/login` - Login page with email/password form
- `/signup` - Registration page with password confirmation
- `/forgot-password` - Forgot password request form
- `/reset-password?token=<token>` - Password reset form

### 6. Protected Routes

All routes except the following require authentication:

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page
- `/api/auth/*` - Auth API routes (as appropriate)

### 7. Route Protection

Implemented via `proxy.ts` (Next.js middleware):

- Checks for valid session cookie
- Validates session in database
- Redirects unauthenticated users to login
- Adds user info to request headers for API routes

## Implementation Details

### Password Hashing

Uses Node.js `crypto.pbkdf2Sync` with:

- 16-byte random salt
- 100,000 iterations
- SHA-256 algorithm
- 64-byte derived key

Passwords stored as: `salt:hash` (hex-encoded)

### Session Management

- Generated using 32 bytes of cryptographic random data
- Stored in HTTP-only cookies
- Validated on each request via database lookup
- Expires after 30 days of inactivity
- Can be manually deleted on logout

### User Flow

#### Signup

1. User enters email and password (with confirmation)
2. Form validates on client
3. Server validates email format and password strength
4. Checks if user already exists
5. Creates user with hashed password
6. Automatically creates session and logs user in
7. Sets HTTP-only session cookie
8. Redirects to overview

#### Login

1. User enters email and password
2. Server looks up user by email (case-insensitive)
3. Verifies password against stored hash
4. Creates new session
5. Sets HTTP-only session cookie
6. Redirects to overview

#### Forgot Password

1. User enters email
2. Server generates reset token (32 bytes, 1-hour expiration)
3. Stores token in database
4. Returns success message (doesn't reveal if email exists)
5. In production, token would be sent via email

#### Reset Password

1. User clicks reset link with token
2. Frontend validates token format
3. User enters new password
4. Server validates token (not expired, exists in database)
5. Validates new password strength
6. Updates user's password hash
7. Deletes used reset token
8. Redirects to login

### Client-Side Utilities

#### `useAuth` Hook

Custom React hook for managing authentication state:

```typescript
const { user, loading, error, logout, refetch } = useAuth();
```

#### `UserMenu` Component

Displays current user email and logout button in sidebar.

## Testing Authentication

### 1. Run migrations

```bash
npm run migrate
```

### 2. Start development server

```bash
npm run dev
```

### 3. Test flow

1. Go to `http://localhost:3000` - redirects to login
2. Click "Sign up" and create account
3. Should be logged in and see overview
4. Click user menu and select logout
5. Should redirect to login
6. Test login with credentials
7. Test forgot password and reset flow

## Environment Variables Required

```
TURSO_DATABASE_URL=<your-database-url>
TURSO_AUTH_TOKEN=<your-auth-token>
```

## Multi-User Support

Each user's data (expenses, tags, etc.) is now isolated by user_id. The expenses and tags tables have been designed with user_id foreign keys to ensure data isolation.

## Future Enhancements

- Email verification for signup
- Two-factor authentication (2FA)
- OAuth / Social login
- Password strength indicator
- Account deactivation
- Login history and active sessions
- Rate limiting for auth endpoints
- Account lockout after failed attempts

## Security Notes

- All sensitive operations use HTTPS in production (via cookie `secure` flag)
- Session tokens are cryptographically random
- Passwords are never stored in plain text
- Reset tokens are single-use and expire quickly
- Email addresses are case-insensitive for login
- API enforces authentication on protected endpoints
