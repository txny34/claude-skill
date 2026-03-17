# Development Setup

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- npm

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure .env with your values (see Environment Variables below)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path. Default: `file:./dev.db` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `AUTH_SECRET` | Yes | NextAuth secret for session encryption |
| `ALLOWED_EMAIL` | Yes | The single Google email allowed to sign in |
| `ANTHROPIC_API_KEY` | Yes | API key for AI agent calls |
| `DAILY_DIAGNOSTIC_LIMIT` | No | Max diagnostic agent calls per day (default: 10) |
| `DAILY_CONTENT_LIMIT` | No | Max content generation calls per day (default: 50) |
| `DAILY_EVALUATION_LIMIT` | No | Max evaluation calls per day (default: 100) |
| `DAILY_JSX_GENERATION_LIMIT` | No | Max JSX generation calls per day (default: 5) |
| `MAX_JSX_ITERATIONS` | No | Max QA loop iterations for JSX generation (default: 3) |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Go to APIs & Services → Credentials
4. Create an OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## Database

The project uses SQLite for simplicity (single-tenant, personal use). The database file is created at `prisma/dev.db`.

### Useful Prisma commands

```bash
# View database in browser
npx prisma studio

# Create a migration after schema changes
npx prisma migrate dev --name describe_your_change

# Reset database (destructive)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

## Build

```bash
# Production build
npx next build

# Start production server
npx next start
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set all environment variables in Vercel dashboard
4. For production SQLite, consider migrating to Turso (hosted SQLite) — update `DATABASE_URL` to a Turso connection string
